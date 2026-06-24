import { useState, useEffect, useCallback } from 'react'
import type { Task, NewTask, JournalEntry, DailySummary, WeeklySummary, AppSettings } from './types'
import { DEFAULT_CATEGORIES, LEGACY_PRIORITY } from './constants'
import { listAll, putDoc, patchDoc, delDoc } from './cloudbase'

// 云数据库集合名（须与 CloudBase 控制台里创建的集合一致）。
const C = {
  tasks: 'tasks',
  journal: 'journal_entries',
  daily: 'daily_summaries',
  weekly: 'weekly_summaries',
  categories: 'categories',
} as const

// 分类在云端按「每个分类一条文档」存储；本地用 {id,name} 便于按 id 删除。
interface CategoryDoc { id: string; name: string }

// 云写入失败时不静默——打到控制台，方便排查。
function logSync(action: string, err: unknown) {
  console.error(`[云同步失败] ${action}:`, err)
}

// settings 仍存本地：theme 是单设备偏好，不入云。
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

// 兼容旧数据：旧优先级（紧急/高/中/低 → P0–P3）；旧任务无 subtasks 字段时补空数组。
function normalizeTask(t: Task): Task {
  const mapped = LEGACY_PRIORITY[t.priority as string]
  return {
    ...t,
    priority: mapped ?? t.priority,
    subtasks: t.subtasks ?? [],
  }
}

export function useAppStore() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [categoryDocs, setCategoryDocs] = useState<CategoryDoc[]>([])
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { theme: 'system' })
  const [loading, setLoading] = useState(true)

  const categories = categoryDocs.map(c => c.name)

  // 登录后加载云端数据（仅挂载时执行一次）。
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [t, j, d, w, c] = await Promise.all([
          listAll(C.tasks),
          listAll(C.journal),
          listAll(C.daily),
          listAll(C.weekly),
          listAll(C.categories),
        ])
        if (cancelled) return
        setTasks((t as Task[]).map(normalizeTask).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
        setJournalEntries((j as JournalEntry[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
        setDailySummaries((d as DailySummary[]).sort((a, b) => a.generatedAt.localeCompare(b.generatedAt)))
        setWeeklySummaries((w as WeeklySummary[]).sort((a, b) => a.generatedAt.localeCompare(b.generatedAt)))
        const cats = c as CategoryDoc[]
        if (cats.length === 0) {
          // 新账号：种入默认分类，保证任务创建始终有可选分类。
          const seeded = DEFAULT_CATEGORIES.map(name => ({ id: crypto.randomUUID(), name }))
          setCategoryDocs(seeded)
          seeded.forEach(doc => putDoc(C.categories, doc.id, doc).catch(e => logSync('初始化分类', e)))
        } else {
          setCategoryDocs(cats)
        }
      } catch (e) {
        logSync('加载数据', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const addTask = useCallback((task: NewTask) => {
    const now = new Date().toISOString()
    const order = tasks.reduce((m, t) => Math.max(m, t.order ?? 0), 0) + 1
    const full: Task = { ...task, id: crypto.randomUUID(), createdAt: now, updatedAt: now, order, subtasks: [] }
    setTasks(prev => [...prev, full])
    putDoc(C.tasks, full.id, full).catch(e => logSync('新增任务', e))
  }, [tasks])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedAt = new Date().toISOString()
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt } : t))
    patchDoc(C.tasks, id, { ...updates, updatedAt }).catch(e => logSync('更新任务', e))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    delDoc(C.tasks, id).catch(e => logSync('删除任务', e))
  }, [])

  // 拖拽重排：按新数组下标重新编号 order，仅持久化发生变化的任务。
  const reorderTasks = useCallback((newOrder: Task[]) => {
    const prevOrder = new Map(tasks.map(t => [t.id, t.order]))
    const renumbered = newOrder.map((t, i) => ({ ...t, order: i }))
    setTasks(renumbered)
    renumbered.forEach((t, i) => {
      if (prevOrder.get(t.id) !== i) patchDoc(C.tasks, t.id, { order: i }).catch(e => logSync('调整顺序', e))
    })
  }, [tasks])

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const record: JournalEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setJournalEntries(prev => [...prev, record])
    putDoc(C.journal, record.id, record).catch(e => logSync('保存日志', e))
  }, [])

  // 同一天重复生成则覆盖既有记录（按 date 去重），云端同步删除旧记录。
  const addDailySummary = useCallback((summary: Omit<DailySummary, 'id' | 'generatedAt'>) => {
    const record: DailySummary = { ...summary, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }
    const stale = dailySummaries.filter(s => s.date === record.date)
    setDailySummaries(prev => [...prev.filter(s => s.date !== record.date), record])
    stale.forEach(s => delDoc(C.daily, s.id).catch(e => logSync('日报去重', e)))
    putDoc(C.daily, record.id, record).catch(e => logSync('保存日报', e))
  }, [dailySummaries])

  // 同一周区间重复生成则覆盖（按 weekStart+weekEnd 去重）。
  const addWeeklySummary = useCallback((summary: Omit<WeeklySummary, 'id' | 'generatedAt'>) => {
    const record: WeeklySummary = { ...summary, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }
    const stale = weeklySummaries.filter(s => s.weekStart === record.weekStart && s.weekEnd === record.weekEnd)
    setWeeklySummaries(prev => [
      ...prev.filter(s => !(s.weekStart === record.weekStart && s.weekEnd === record.weekEnd)),
      record,
    ])
    stale.forEach(s => delDoc(C.weekly, s.id).catch(e => logSync('周报去重', e)))
    putDoc(C.weekly, record.id, record).catch(e => logSync('保存周报', e))
  }, [weeklySummaries])

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    if (categoryDocs.some(c => c.name === n)) return
    const doc: CategoryDoc = { id: crypto.randomUUID(), name: n }
    setCategoryDocs(prev => [...prev, doc])
    putDoc(C.categories, doc.id, doc).catch(e => logSync('添加分类', e))
  }, [categoryDocs])

  // Keep at least one category so task creation always has a valid default.
  const deleteCategory = useCallback((name: string) => {
    if (categoryDocs.length <= 1) return
    const doc = categoryDocs.find(c => c.name === name)
    if (!doc) return
    setCategoryDocs(prev => prev.filter(c => c.id !== doc.id))
    delDoc(C.categories, doc.id).catch(e => logSync('删除分类', e))
  }, [categoryDocs])

  return {
    loading,
    tasks, addTask, updateTask, deleteTask, reorderTasks,
    journalEntries, addJournalEntry,
    dailySummaries, addDailySummary,
    weeklySummaries, addWeeklySummary,
    settings, updateSettings,
    categories, addCategory, deleteCategory,
  }
}
