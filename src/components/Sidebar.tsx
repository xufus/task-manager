import { useState } from 'react'
import type { Task, Priority, Status } from '../types'
import { PRIORITIES, STATUSES, CATEGORIES } from '../constants'
import StatusIcon from './StatusIcon'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ff4444', high: '#f5a623', normal: '#5e6ad2', low: '#8a8a9a',
}

export default function Sidebar({ tasks, selectedId, onSelect, onAdd, onDelete }: Props) {
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
    height: 28,
    padding: '0 24px 0 8px',
    borderRadius: 6,
    fontSize: 11,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e2e8',
    cursor: 'pointer',
    appearance: 'none',
    transition: 'border-color 0.1s',
    boxSizing: 'border-box',
  }

  const ChevronDown = () => (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="M1 1L5 5L9 1" stroke="#8a8a9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div style={{
      width: 220, flexShrink: 0, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#0a0a0e',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            我的任务
          </span>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
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
            width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e2e2e8', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>筛选</span>
        {[
          { value: filterStatus, onChange: (v: string) => setFilterStatus(v as Status | 'all'), options: [{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s.value, label: s.label }))] },
          { value: filterCategory, onChange: (v: string) => setFilterCategory(v), options: [{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: c }))] },
          { value: filterPriority, onChange: (v: string) => setFilterPriority(v as Priority | 'all'), options: [{ value: 'all', label: '全部优先级' }, ...PRIORITIES.map(p => ({ value: p.value, label: p.label }))] },
        ].map((sel, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <select
              value={sel.value}
              onChange={e => sel.onChange(e.target.value)}
              style={selStyle}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
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
          <div style={{ textAlign: 'center', color: '#8a8a9a', fontSize: 12, padding: '24px 0' }}>暂无任务</div>
        ) : (
          filtered.map(task => {
            const isSelected = selectedId === task.id
            return (
              <div
                key={task.id}
                onClick={() => onSelect(task.id)}
                style={{
                  position: 'relative',
                  padding: '7px 12px 7px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  background: isSelected ? 'rgba(94,106,210,0.1)' : 'transparent',
                  transition: 'background 0.1s',
                  borderLeft: isSelected ? '2px solid #5e6ad2' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <StatusIcon status={task.status} size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 400,
                    color: task.status === 'done' ? '#8a8a9a' : '#e2e2e8',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{task.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: PRIORITY_COLORS[task.priority],
                    }} />
                    <span style={{ fontSize: 11, color: '#8a8a9a' }}>{task.category}</span>
                    {task.deadline && (
                      <span style={{
                        fontSize: 11,
                        color: new Date(task.deadline) < new Date() && task.status !== 'done' ? '#ff4444' : '#8a8a9a',
                      }}>· {task.deadline}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(task.id) }}
                  style={{
                    background: 'none', border: 'none', color: '#8a8a9a',
                    cursor: 'pointer', padding: '0 2px', fontSize: 12, lineHeight: 1,
                    opacity: 0, transition: 'opacity 0.1s',
                    flexShrink: 0,
                  }}
                  className="sidebar-delete-btn"
                  onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8a8a9a' }}
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
            style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: 20, width: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e2e8', marginBottom: 16 }}>新建任务</div>
            <TaskForm onSubmit={data => { onAdd(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
