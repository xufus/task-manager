import type { Task } from '../types'

interface Props {
  tasks: Task[]
  onGenerateSummary: () => void
  onGenerateWeekly: () => void
  generating: boolean
  onOpenSettings: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function StatsBar({ tasks, onGenerateSummary, onGenerateWeekly, generating, onOpenSettings, theme, onToggleTheme }: Props) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length

  const btnBase: React.CSSProperties = {
    padding: '5px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'filter 0.1s',
    border: '1px solid rgba(var(--on),0.1)',
    background: 'rgba(var(--on),0.05)',
    color: 'var(--text-muted)',
  }

  return (
    <div style={{
      height: 56,
      flexShrink: 0,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 16px',
      borderBottom: '1px solid rgba(var(--on),0.06)',
      background: 'var(--bg-elevated)',
    }}>
      <span style={{ fontWeight: 600, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>
        Tasks
      </span>

      <div style={{ width: '1px', height: 16, background: 'rgba(var(--on),0.08)' }} />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>个任务</span>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(var(--on),0.12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{inProgress}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>进行中</span>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(var(--on),0.12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{done}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>已完成</span>
        </div>
        {overdue > 0 && (
          <>
            <div style={{ width: 1, height: 28, background: 'rgba(var(--on),0.12)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: '#ff4444', lineHeight: 1 }}>{overdue}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>逾期</span>
            </div>
          </>
        )}
      </div>

      {total > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: 'rgba(var(--on),0.08)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(to right, #5e6ad2, #7b8ce8)',
            width: `${Math.round((done / total) * 100)}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={onGenerateSummary} disabled={generating}
          style={{ ...btnBase, color: generating ? 'var(--text-muted)' : '#c4b5fd' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{generating ? '生成中…' : 'AI 日报'}</button>
        <button
          onClick={onGenerateWeekly} disabled={generating}
          style={{ ...btnBase, color: generating ? 'var(--text-muted)' : '#93c5fd' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{generating ? '生成中…' : 'AI 周报'}</button>
        <button
          onClick={onToggleTheme}
          style={{ ...btnBase, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
        >
          {theme === 'dark' ? (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round" style={{ stroke: 'var(--text-muted)' }}>
              <circle cx="8" cy="8" r="3.2" />
              <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M3.05 12.95l1.13-1.13M11.82 4.18l1.13-1.13" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinejoin="round" style={{ stroke: 'var(--text-muted)' }}>
              <path d="M13.5 9.5A5.5 5.5 0 1 1 6.5 2.5a4.3 4.3 0 0 0 7 7Z" />
            </svg>
          )}
        </button>
        <button
          onClick={onOpenSettings}
          style={{ ...btnBase }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          title="设置"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round" style={{ stroke: 'var(--text-muted)' }}>
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
