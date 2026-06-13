import type { Task } from '../types'

interface Props {
  tasks: Task[]
  onGenerateSummary: () => void
  onGenerateWeekly: () => void
  generating: boolean
  onOpenSettings: () => void
}

export default function StatsBar({ tasks, onGenerateSummary, onGenerateWeekly, generating, onOpenSettings }: Props) {
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
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#8a8a9a',
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
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: '#0a0a0e',
    }}>
      <span style={{ fontWeight: 600, fontSize: 18, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
        Tasks
      </span>

      <div style={{ width: '1px', height: 16, background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: '#e2e2e8', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 12, color: '#8a8a9a', marginTop: 3 }}>个任务</span>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: '#e2e2e8', lineHeight: 1 }}>{inProgress}</span>
          <span style={{ fontSize: 12, color: '#8a8a9a', marginTop: 3 }}>进行中</span>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: '#e2e2e8', lineHeight: 1 }}>{done}</span>
          <span style={{ fontSize: 12, color: '#8a8a9a', marginTop: 3 }}>已完成</span>
        </div>
        {overdue > 0 && (
          <>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 700, color: '#ff4444', lineHeight: 1 }}>{overdue}</span>
              <span style={{ fontSize: 12, color: '#8a8a9a', marginTop: 3 }}>逾期</span>
            </div>
          </>
        )}
      </div>

      {total > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
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
          style={{ ...btnBase, color: generating ? '#8a8a9a' : '#c4b5fd' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{generating ? '生成中…' : 'AI 日报'}</button>
        <button
          onClick={onGenerateWeekly} disabled={generating}
          style={{ ...btnBase, color: generating ? '#8a8a9a' : '#93c5fd' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{generating ? '生成中…' : 'AI 周报'}</button>
        <button
          onClick={onOpenSettings}
          style={{ ...btnBase }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          title="设置"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#8a8a9a" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
