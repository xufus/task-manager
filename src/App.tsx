import { useState, useEffect } from 'react'
import { useAppStore } from './store'
import Sidebar from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import Journal from './components/Journal'
import TaskDetail from './components/TaskDetail'
import StatsBar from './components/StatsBar'
import SummaryModal from './components/SummaryModal'
import SummaryHistoryModal from './components/SummaryHistoryModal'
import SettingsPanel from './components/SettingsPanel'
import LoginPage from './components/LoginPage'
import { generateDailySummary, generateWeeklyReport } from './ai'
import { getCurrentUser, logout, type AuthUser } from './cloudbase'

type MainView = 'kanban' | 'detail'

// 登录门禁：未登录显示登录页，登录后才渲染主应用（主应用会读写云数据）。
export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(u => { setUser(u); setAuthReady(true) })
  }, [])

  // 登录页也需要正确主题：从本地 settings 读取并应用（settings 仍存 localStorage）。
  useEffect(() => {
    try {
      const raw = localStorage.getItem('settings')
      const theme = (raw ? JSON.parse(raw).theme : 'system') || 'system'
      const dark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    } catch { /* 忽略 */ }
  }, [])

  async function handleLogout() {
    await logout()
    setUser(null)
  }

  if (!authReady) {
    return (
      <div style={{
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 13,
      }}>加载中…</div>
    )
  }

  if (!user) return <LoginPage onAuthed={setUser} />

  return <MainApp username={user.username} onLogout={handleLogout} />
}

function MainApp({ username, onLogout }: { username: string; onLogout: () => void }) {
  const store = useAppStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [mainView, setMainView] = useState<MainView>('kanban')
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState<{ title: string; content: string; time?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  // Apply theme to <html data-theme>; resolve 'system' and follow OS changes.
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const t = store.settings.theme
      const resolved = t === 'system' ? (mq.matches ? 'dark' : 'light') : t
      root.dataset.theme = resolved
      setResolvedTheme(resolved)
    }
    apply()
    if (store.settings.theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [store.settings.theme])

  function toggleTheme() {
    store.updateSettings({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' })
  }

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') Notification.requestPermission()
    if (Notification.permission !== 'granted') return
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000)
    store.tasks.forEach(t => {
      if (t.status === 'done' || !t.deadline) return
      const dl = new Date(t.deadline)
      if (dl <= soon && dl >= new Date())
        new Notification('任务即将到期', { body: `"${t.title}" 将于明天截止` })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function selectTask(id: string) {
    setSelectedTaskId(id)
    setMainView('detail')
  }

  function closeDetail() {
    setMainView('kanban')
    setSelectedTaskId(null)
  }

  async function handleGenerateSummary() {
    if (!store.settings.apiKey) { setError('请先在设置中填入 DeepSeek API Key'); return }
    setGenerating(true)
    try {
      const content = await generateDailySummary(store.settings.apiKey, store.tasks, store.journalEntries)
      const today = new Date().toLocaleDateString('zh-CN')
      store.addDailySummary({ date: today, content })
      setSummary({ title: `${today} 工作日报`, content, time: new Date().toLocaleString('zh-CN') })
    } catch (e) { setError(`生成失败: ${(e as Error).message}`) }
    finally { setGenerating(false) }
  }

  async function handleGenerateWeekly() {
    if (!store.settings.apiKey) { setError('请先在设置中填入 DeepSeek API Key'); return }
    setGenerating(true)
    try {
      const content = await generateWeeklyReport(store.settings.apiKey, store.tasks, store.journalEntries)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      store.addWeeklySummary({ weekStart: weekAgo.toLocaleDateString('zh-CN'), weekEnd: now.toLocaleDateString('zh-CN'), content })
      setSummary({ title: '本周工作周报', content, time: new Date().toLocaleString('zh-CN') })
    } catch (e) { setError(`生成失败: ${(e as Error).message}`) }
    finally { setGenerating(false) }
  }

  const selectedTask = store.tasks.find(t => t.id === selectedTaskId) ?? null

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: active ? 500 : 400,
    cursor: 'pointer', border: 'none', transition: 'all 0.1s',
    background: active ? 'rgba(94,106,210,0.15)' : 'transparent',
    color: active ? '#5e6ad2' : 'var(--text-muted)',
  })

  if (store.loading) {
    return (
      <div style={{
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 13,
      }}>加载数据中…</div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>
      <StatsBar
        tasks={store.tasks}
        onGenerateSummary={handleGenerateSummary}
        onGenerateWeekly={handleGenerateWeekly}
        generating={generating}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        theme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          tasks={store.tasks}
          categories={store.categories}
          onAddCategory={store.addCategory}
          onDeleteCategory={store.deleteCategory}
          selectedId={selectedTaskId}
          onSelect={selectTask}
          onAdd={store.addTask}
          onDelete={id => { store.deleteTask(id); if (selectedTaskId === id) closeDetail() }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* View tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
            borderBottom: '1px solid rgba(var(--on),0.06)',
            background: 'var(--bg)',
          }}>
            <button onClick={() => setMainView('kanban')} style={tabBtn(mainView === 'kanban')}>看板</button>
            {selectedTask && (
              <button onClick={() => setMainView('detail')} style={tabBtn(mainView === 'detail')}>详情</button>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', padding: 12 }}>
            {mainView === 'kanban' ? (
              <KanbanBoard
                tasks={store.tasks}
                categories={store.categories}
                onUpdateTask={store.updateTask}
                onReorder={store.reorderTasks}
                onDeleteTask={store.deleteTask}
                onTaskExpand={setSelectedTaskId}
              />
            ) : (
              <TaskDetail
                task={selectedTask}
                categories={store.categories}
                onUpdate={store.updateTask}
                onDelete={id => { store.deleteTask(id); closeDetail() }}
                onClose={closeDetail}
              />
            )}
          </div>
        </div>

        <Journal
          entries={store.journalEntries}
          tasks={store.tasks}
          activeTaskId={selectedTaskId}
          onAdd={store.addJournalEntry}
        />
      </div>

      {showSettings && (
        <SettingsPanel
          settings={store.settings}
          onUpdate={store.updateSettings}
          onClose={() => setShowSettings(false)}
          username={username}
          onLogout={onLogout}
        />
      )}

      {showHistory && (
        <SummaryHistoryModal
          dailySummaries={store.dailySummaries}
          weeklySummaries={store.weeklySummaries}
          onView={(title, content, time) => { setSummary({ title, content, time }); setShowHistory(false) }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {summary && (
        <SummaryModal title={summary.title} content={summary.content} time={summary.time} onClose={() => setSummary(null)} />
      )}

      {error && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 60,
          background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#ff4444',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', opacity: 0.7, fontSize: 13 }}>✕</button>
        </div>
      )}
    </div>
  )
}
