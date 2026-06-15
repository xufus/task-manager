import { useState, useEffect, useCallback } from 'react'
import type { Task, JournalEntry, DailySummary, WeeklySummary, AppSettings } from './types'
import { DEFAULT_CATEGORIES, LEGACY_PRIORITY } from './constants'

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

export function useAppStore() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', [])
  const [dailySummaries, setDailySummaries] = useLocalStorage<DailySummary[]>('dailySummaries', [])
  const [weeklySummaries, setWeeklySummaries] = useLocalStorage<WeeklySummary[]>('weeklySummaries', [])
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { apiKey: '', theme: 'system' })
  const [categories, setCategories] = useLocalStorage<string[]>('categories', DEFAULT_CATEGORIES)

  // 一次性迁移旧优先级（紧急/高/中/低 → P0/P1/P2/P3）。
  useEffect(() => {
    setTasks(prev => {
      let changed = false
      const next = prev.map(t => {
        const mapped = LEGACY_PRIORITY[t.priority as string]
        if (mapped) { changed = true; return { ...t, priority: mapped } }
        return t
      })
      return changed ? next : prev
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setTasks(prev => [...prev, { ...task, id: crypto.randomUUID(), createdAt: now, updatedAt: now }])
  }, [setTasks])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
  }, [setTasks])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [setTasks])

  const reorderTasks = useCallback((newOrder: Task[]) => {
    setTasks(newOrder)
  }, [setTasks])

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    setJournalEntries(prev => [...prev, { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }])
  }, [setJournalEntries])

  // 同一天重复生成则覆盖既有记录（按 date 去重），不再堆叠。
  const addDailySummary = useCallback((summary: Omit<DailySummary, 'id' | 'generatedAt'>) => {
    const record: DailySummary = { ...summary, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }
    setDailySummaries(prev => [...prev.filter(s => s.date !== record.date), record])
  }, [setDailySummaries])

  // 同一周区间重复生成则覆盖（按 weekStart+weekEnd 去重）。
  const addWeeklySummary = useCallback((summary: Omit<WeeklySummary, 'id' | 'generatedAt'>) => {
    const record: WeeklySummary = { ...summary, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }
    setWeeklySummaries(prev => [
      ...prev.filter(s => !(s.weekStart === record.weekStart && s.weekEnd === record.weekEnd)),
      record,
    ])
  }, [setWeeklySummaries])

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setCategories(prev => prev.includes(n) ? prev : [...prev, n])
  }, [setCategories])

  // Keep at least one category so task creation always has a valid default.
  const deleteCategory = useCallback((name: string) => {
    setCategories(prev => prev.length <= 1 ? prev : prev.filter(c => c !== name))
  }, [setCategories])

  return {
    tasks, addTask, updateTask, deleteTask, reorderTasks,
    journalEntries, addJournalEntry,
    dailySummaries, addDailySummary,
    weeklySummaries, addWeeklySummary,
    settings, updateSettings,
    categories, addCategory, deleteCategory,
  }
}
