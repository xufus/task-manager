import { useState, useRef, useEffect } from 'react'
import type { Priority } from '../types'
import { categoryStyle } from '../constants'
import {
  type KanbanFilters, type SortKey, type DueFilter,
  EMPTY_FILTERS, activeFilterCount,
} from '../kanbanFilters'

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ff4444', high: '#f5a623', normal: '#5e6ad2', low: 'var(--text-muted)',
}
const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '低' },
]
const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今天到期' },
  { value: 'week', label: '本周到期' },
  { value: 'overdue', label: '已逾期' },
]
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: '默认顺序' },
  { value: 'priority-desc', label: '优先级从高到低' },
  { value: 'priority-asc', label: '优先级从低到高' },
  { value: 'deadline-asc', label: '截止日期从近到远' },
  { value: 'deadline-desc', label: '截止日期从远到近' },
  { value: 'created-desc', label: '创建时间从新到旧' },
  { value: 'created-asc', label: '创建时间从旧到新' },
]

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px',
  fontSize: 13, cursor: 'pointer', borderRadius: 4,
}
const hoverOn = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = 'rgba(var(--on),0.05)')
const hoverOff = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = 'transparent')

const sectionLabel: React.CSSProperties = {
  fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.06em', padding: '6px 8px 3px',
}

function Check({ on, color }: { on: boolean; color: string }) {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: 4, flexShrink: 0,
      border: `1.5px solid ${on ? color : 'rgba(var(--on),0.25)'}`,
      background: on ? color : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {on && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.3 6L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

function Radio({ on }: { on: boolean }) {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
      border: `1.5px solid ${on ? '#5e6ad2' : 'rgba(var(--on),0.25)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {on && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5e6ad2' }} />}
    </span>
  )
}

export default function KanbanToolbar({ filters, onChange, categories }: {
  filters: KanbanFilters
  onChange: (next: KanbanFilters) => void
  categories: string[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const count = activeFilterCount(filters)
  const active = count > 0

  function togglePriority(p: Priority) {
    const has = filters.priorities.includes(p)
    onChange({ ...filters, priorities: has ? filters.priorities.filter(x => x !== p) : [...filters.priorities, p] })
  }
  function toggleCategory(c: string) {
    const has = filters.categories.includes(c)
    onChange({ ...filters, categories: has ? filters.categories.filter(x => x !== c) : [...filters.categories, c] })
  }
  function setDue(d: DueFilter) { onChange({ ...filters, due: d }) }
  function reset() { onChange({ ...EMPTY_FILTERS, sort: filters.sort }) }

  return (
    <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* 筛选按钮 + 弹出面板 */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            height: 28, padding: '0 10px', borderRadius: 6, fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            background: active ? 'rgba(94,106,210,0.2)' : 'transparent',
            border: `1px solid ${active ? '#5e6ad2' : 'rgba(var(--on),0.1)'}`,
            color: active ? '#5e6ad2' : 'var(--text-muted)',
            transition: 'background 0.1s, border-color 0.1s, color 0.1s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 2.5h11M3.5 7h7M6 11.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          筛选
          {active && (
            <span style={{
              minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8,
              background: '#5e6ad2', color: '#fff', fontSize: 10, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{count}</span>
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 30, width: 220,
            background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)', padding: 4, maxHeight: 380, overflowY: 'auto',
          }}>
            <div style={sectionLabel}>优先级</div>
            {PRIORITY_OPTIONS.map(p => {
              const on = filters.priorities.includes(p.value)
              return (
                <div key={p.value} onClick={() => togglePriority(p.value)} style={rowStyle}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <Check on={on} color="#5e6ad2" />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[p.value], flexShrink: 0 }} />
                  <span style={{ color: 'var(--text)' }}>{p.label}</span>
                </div>
              )
            })}

            <div style={{ height: 1, background: 'rgba(var(--on),0.08)', margin: '4px 0' }} />
            <div style={sectionLabel}>分类</div>
            {categories.length === 0 && (
              <div style={{ ...rowStyle, color: 'var(--text-faint)', cursor: 'default' }}>暂无分类</div>
            )}
            {categories.map(c => {
              const on = filters.categories.includes(c)
              const cs = categoryStyle(c)
              return (
                <div key={c} onClick={() => toggleCategory(c)} style={rowStyle}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <Check on={on} color={cs.dot} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cs.dot, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                </div>
              )
            })}

            <div style={{ height: 1, background: 'rgba(var(--on),0.08)', margin: '4px 0' }} />
            <div style={sectionLabel}>截止日期</div>
            {DUE_OPTIONS.map(d => (
              <div key={d.value} onClick={() => setDue(d.value)} style={rowStyle}
                onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                <Radio on={filters.due === d.value} />
                <span style={{ color: 'var(--text)' }}>{d.label}</span>
              </div>
            ))}

            <div style={{ height: 1, background: 'rgba(var(--on),0.08)', margin: '4px 0' }} />
            <button
              type="button"
              onClick={reset}
              disabled={!active}
              style={{
                width: '100%', height: 30, borderRadius: 4, fontSize: 12, marginTop: 2,
                cursor: active ? 'pointer' : 'default',
                background: 'transparent', border: '1px solid rgba(var(--on),0.1)',
                color: active ? 'var(--text)' : 'var(--text-faint)',
              }}
            >重置筛选</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* 排序下拉 */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}>
          <path d="M4 2.5v9M4 11.5L2 9.5M4 11.5L6 9.5M9 2.5h4M9 6h3M9 9.5h2" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as SortKey })}
          style={{
            height: 28, padding: '0 24px 0 26px', borderRadius: 6, fontSize: 12,
            background: 'transparent', border: '1px solid rgba(var(--on),0.1)',
            color: 'var(--text)', cursor: 'pointer', appearance: 'none',
            boxSizing: 'border-box', maxWidth: 180,
          }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }}>
          <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--text-muted)' }} />
        </svg>
      </div>
    </div>
  )
}
