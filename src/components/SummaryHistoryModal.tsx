import { useState } from 'react'
import type { DailySummary, WeeklySummary } from '../types'

interface Props {
  dailySummaries: DailySummary[]
  weeklySummaries: WeeklySummary[]
  onView: (title: string, content: string, time?: string) => void
  onClose: () => void
}

type Tab = 'daily' | 'weekly'

export default function SummaryHistoryModal({ dailySummaries, weeklySummaries, onView, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('daily')

  // 最新在前。
  const daily = [...dailySummaries].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
  const weekly = [...weeklySummaries].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: active ? 500 : 400,
    cursor: 'pointer', border: 'none', transition: 'all 0.1s',
    background: active ? 'rgba(94,106,210,0.15)' : 'transparent',
    color: active ? '#5e6ad2' : 'var(--text-muted)',
  })

  const rows = tab === 'daily'
    ? daily.map(s => ({
        key: s.id,
        title: `${s.date} 工作日报`,
        sub: new Date(s.generatedAt).toLocaleString('zh-CN'),
        content: s.content,
      }))
    : weekly.map(s => ({
        key: s.id,
        title: `${s.weekStart} ~ ${s.weekEnd} 工作周报`,
        sub: new Date(s.generatedAt).toLocaleString('zh-CN'),
        content: s.content,
      }))

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6,
          maxWidth: 560, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(var(--on),0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>历史报告</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={tabBtn(tab === 'daily')} onClick={() => setTab('daily')}>日报 {daily.length}</button>
              <button style={tabBtn(tab === 'weekly')} onClick={() => setTab('weekly')}>周报 {weekly.length}</button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {rows.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
              {tab === 'daily' ? '暂无日报记录' : '暂无周报记录'}
            </div>
          ) : (
            rows.map(r => (
              <div
                key={r.key}
                onClick={() => onView(r.title, r.content, r.sub)}
                style={{ padding: '10px 12px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--on),0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{r.sub}</span>
                </div>
                <p style={{
                  margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>{r.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
