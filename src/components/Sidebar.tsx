import { useState } from 'react'
import type { Task, Priority, Status } from '../types'
import { PRIORITIES, STATUSES, categoryStyle } from '../constants'
import StatusIcon from './StatusIcon'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  categories: string[]
  onAddCategory: (name: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ff4444', high: '#f5a623', normal: '#5e6ad2', low: 'var(--text-muted)',
}
const PRIORITY_TITLE_COLORS: Record<Priority, string> = {
  urgent: '#ff6b6b', high: '#f5a623', normal: 'var(--text)', low: 'var(--text-muted)',
}
function PriorityIcon({ priority, status }: { priority: Priority; status: Status }) {
  if (status === 'done') return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5l3.5 3.5L11 1" stroke="#00c853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (priority === 'urgent') return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="4" fill="#ff4444"/>
    </svg>
  )
  if (priority === 'high') return (
    <svg width="10" height="9" viewBox="0 0 10 9" style={{ flexShrink: 0 }}>
      <polygon points="5,0 10,9 0,9" fill="#f5a623"/>
    </svg>
  )
  if (priority === 'normal') return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="4" fill="#5e6ad2"/>
    </svg>
  )
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="3" strokeWidth="1.5" style={{ stroke: 'var(--text-muted)' }}/>
    </svg>
  )
}

export default function Sidebar({ tasks, categories, onAddCategory, selectedId, onSelect, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selStyle: React.CSSProperties = {
    width: '100%',
    height: 32,
    padding: '0 24px 0 8px',
    borderRadius: 6,
    fontSize: 13,
    background: 'transparent',
    border: '1px solid rgba(var(--on),0.1)',
    color: 'var(--text)',
    cursor: 'pointer',
    appearance: 'none',
    transition: 'border-color 0.1s',
    boxSizing: 'border-box',
  }

  const ChevronDown = () => (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--text-muted)' }} />
    </svg>
  )

  return (
    <div style={{
      width: 260, flexShrink: 0, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-elevated)',
      borderRight: '1px solid rgba(var(--on),0.06)',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(var(--on),0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            我的任务
          </span>
          <button
            onClick={() => setShowForm(true)}
            style={{
              height: 30, padding: '0 10px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: '#5e6ad2', color: '#fff', border: 'none', cursor: 'pointer',
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >+ 新建</button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索任务…"
          style={{
            width: '100%', height: 34, padding: '0 8px', borderRadius: 6, fontSize: 13,
            background: 'rgba(var(--on),0.04)',
            border: '1px solid rgba(var(--on),0.06)',
            color: 'var(--text)', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(var(--on),0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>筛选</span>
        {[
          { value: filterStatus, onChange: (v: string) => setFilterStatus(v as Status | 'all'), options: [{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s.value, label: s.label }))] },
          { value: filterCategory, onChange: (v: string) => setFilterCategory(v), options: [{ value: 'all', label: '全部分类' }, ...categories.map(c => ({ value: c, label: c }))] },
          { value: filterPriority, onChange: (v: string) => setFilterPriority(v as Priority | 'all'), options: [{ value: 'all', label: '全部优先级' }, ...PRIORITIES.map(p => ({ value: p.value, label: p.label }))] },
        ].map((sel, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <select
              value={sel.value}
              onChange={e => sel.onChange(e.target.value)}
              style={selStyle}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.1)')}
            >
              {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown />
          </div>
        ))}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '24px 0' }}>暂无任务</div>
        ) : (
          filtered.map(task => {
            const isSelected = selectedId === task.id
            return (
              <div
                key={task.id}
                onClick={() => onSelect(task.id)}
                style={{
                  position: 'relative',
                  padding: '5px 12px 4px 14px',
                  minHeight: 36, boxSizing: 'border-box',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(var(--on),0.04)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  background: isSelected ? 'rgba(94,106,210,0.1)' : 'transparent',
                  transition: 'background 0.1s, opacity 0.1s',
                  opacity: task.status === 'done' ? 0.6 : 1,
                  borderLeft: `3px solid ${isSelected ? '#5e6ad2' : PRIORITY_COLORS[task.priority]}`,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(var(--on),0.04)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <StatusIcon status={task.status} size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: task.status === 'done' ? 'var(--text-faint)' : PRIORITY_TITLE_COLORS[task.priority],
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{task.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <PriorityIcon priority={task.priority} status={task.status} />
                    <span style={{ fontSize: 11, color: task.status === 'done' ? 'var(--text-faint)' : categoryStyle(task.category).text }}>{task.category}</span>
                    {task.deadline && (
                      <span style={{
                        fontSize: 11,
                        color: new Date(task.deadline) < new Date() && task.status !== 'done' ? '#ff4444' : 'var(--text-muted)',
                      }}>· {task.deadline}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(task.id) }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '0 2px', fontSize: 12, lineHeight: 1,
                    opacity: 0, transition: 'opacity 0.1s',
                    flexShrink: 0,
                  }}
                  className="sidebar-delete-btn"
                  onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                >✕</button>
              </div>
            )
          })
        )}
      </div>

      {/* New task modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6, padding: 20, width: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>新建任务</div>
            <TaskForm categories={categories} onAddCategory={onAddCategory} onSubmit={data => { onAdd(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
