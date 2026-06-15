import { useState, useRef, useEffect } from 'react'
import type { Task, NewTask, Priority, Status } from '../types'
import { PRIORITIES, PRIORITY_META, STATUSES, categoryStyle } from '../constants'
import StatusIcon from './StatusIcon'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  categories: string[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (name: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: NewTask) => void
  onDelete: (id: string) => void
}

// Category filter that doubles as a management panel: filter by category,
// delete a category (× per row), or add a new one (input at the bottom).
function CategoryFilter({ value, onChange, categories, onAddCategory, onDeleteCategory }: {
  value: string
  onChange: (v: string) => void
  categories: string[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [newCat, setNewCat] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function add() {
    const n = newCat.trim()
    if (!n) return
    onAddCategory(n)
    setNewCat('')
  }

  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: 13, cursor: 'pointer', borderRadius: 4 }
  const hoverOn = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = 'rgba(var(--on),0.05)')
  const hoverOff = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = 'transparent')

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 32, padding: '0 24px 0 8px', borderRadius: 6, fontSize: 13,
          background: 'transparent', border: '1px solid rgba(var(--on),0.1)', color: 'var(--text)',
          cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value === 'all' ? '全部分类' : value}
        </span>
      </button>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', pointerEvents: 'none', transition: 'transform 0.15s' }}>
        <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--text-muted)' }} />
      </svg>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30,
          background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6,
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)', padding: 4, maxHeight: 280, overflowY: 'auto',
        }}>
          <div
            onClick={() => { onChange('all'); setOpen(false) }}
            style={{ ...rowStyle, color: value === 'all' ? '#7b8ce8' : 'var(--text)' }}
            onMouseEnter={hoverOn} onMouseLeave={hoverOff}
          >全部分类</div>
          {categories.map(c => {
            const cs = categoryStyle(c)
            return (
              <div
                key={c}
                onClick={() => { onChange(c); setOpen(false) }}
                style={{ ...rowStyle, justifyContent: 'space-between', color: value === c ? cs.text : 'var(--text)' }}
                onMouseEnter={hoverOn} onMouseLeave={hoverOff}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cs.dot, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                </span>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onDeleteCategory(c); if (value === c) onChange('all') }}
                    title="删除分类"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >✕</button>
                )}
              </div>
            )
          })}
          <div style={{ height: 1, background: 'rgba(var(--on),0.08)', margin: '4px 0' }} />
          <div style={{ display: 'flex', gap: 4, padding: 4 }}>
            <input
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="新分类…"
              style={{ flex: 1, height: 28, padding: '0 8px', borderRadius: 4, fontSize: 13, background: 'rgba(var(--on),0.04)', border: '1px solid rgba(var(--on),0.1)', color: 'var(--text)', boxSizing: 'border-box' }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            />
            <button
              type="button"
              onClick={add}
              style={{ padding: '0 10px', height: 28, borderRadius: 4, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', background: 'rgba(94,106,210,0.15)', border: '1px solid rgba(94,106,210,0.3)', color: '#7b8ce8' }}
            >添加</button>
          </div>
        </div>
      )}
    </div>
  )
}

// 任务标题色：P0 用偏亮的红，其余沿用各象限主色，P3 用克制的灰避免过艳。
const PRIORITY_TITLE_COLORS: Record<Priority, string> = {
  p0: '#ff6b6b', p1: '#7b8ce8', p2: '#f5a623', p3: 'var(--text-muted)',
}
function PriorityIcon({ priority, status }: { priority: Priority; status: Status }) {
  if (status === 'done') return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5l3.5 3.5L11 1" stroke="#00c853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (priority === 'p0') return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="4" fill="#ff4444"/>
    </svg>
  )
  if (priority === 'p1') return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="4" fill="#5e6ad2"/>
    </svg>
  )
  if (priority === 'p2') return (
    <svg width="10" height="9" viewBox="0 0 10 9" style={{ flexShrink: 0 }}>
      <polygon points="5,0 10,9 0,9" fill="#f5a623"/>
    </svg>
  )
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="4" r="3" strokeWidth="1.5" style={{ stroke: '#5a9e5a' }}/>
    </svg>
  )
}

export default function Sidebar({ tasks, categories, onAddCategory, onDeleteCategory, selectedId, onSelect, onAdd, onDelete }: Props) {
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

        <div style={{ position: 'relative' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as Status | 'all')}
            style={selStyle}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.25)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.1)')}
          >
            <option value="all">全部状态</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown />
        </div>

        <CategoryFilter
          value={filterCategory}
          onChange={setFilterCategory}
          categories={categories}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
        />

        <div style={{ position: 'relative' }}>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
            style={selStyle}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.25)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(var(--on),0.1)')}
          >
            <option value="all">全部优先级</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.short}: {p.label}</option>)}
          </select>
          <ChevronDown />
        </div>
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
                  borderLeft: `3px solid ${isSelected ? '#5e6ad2' : PRIORITY_META[task.priority].color}`,
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
            <TaskForm categories={categories} onSubmit={data => { onAdd(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
