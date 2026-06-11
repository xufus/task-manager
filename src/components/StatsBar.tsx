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
      height: 44,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: '#0a0a0e',
    }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
        Tasks
      </span>

      <div style={{ width: '1px', height: 16, background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#8a8a9a' }}>
        <span><span style={{ color: '#e2e2e8', fontWeight: 500 }}>{total}</span> 个任务</span>
        <span style={{ color: '#5e6ad2', fontWeight: 500 }}>{inProgress} 进行中</span>
        <span style={{ color: '#00c853', fontWeight: 500 }}>{done} 已完成</span>
        {overdue > 0 && <span style={{ color: '#ff4444', fontWeight: 500 }}>{overdue} 逾期</span>}
      </div>

      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 80, height: 3, borderRadius: 2,
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: '#5e6ad2',
              width: `${Math.round((done / total) * 100)}%`,
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 11, color: '#8a8a9a' }}>{Math.round((done / total) * 100)}%</span>
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
