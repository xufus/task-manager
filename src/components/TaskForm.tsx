import { useState } from 'react'
import type { Task, Priority, Status } from '../types'
import { PRIORITIES, STATUSES, COLORS } from '../constants'

interface Props {
  initial?: Partial<Task>
  categories: string[]
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ff4444', high: '#f5a623', normal: '#5e6ad2', low: 'var(--text-muted)',
}

export default function TaskForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[5])
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'normal')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'todo')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')

  // Keep an orphan category (e.g. its definition was later deleted) selectable.
  const catOptions = category && !categories.includes(category) ? [category, ...categories] : categories

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description, category, color, priority, status, deadline: deadline || null })
  }

  const label: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 10px', borderRadius: 6, fontSize: 13, background: 'rgba(var(--on),0.04)', border: '1px solid rgba(var(--on),0.1)', color: 'var(--text)', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={label}>标题</label>
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="任务标题" autoFocus />
      </div>

      <div>
        <label style={label}>描述</label>
        <textarea
          style={{ ...inputStyle, resize: 'none' as const, lineHeight: 1.5 }}
          rows={3} value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="任务描述（可选）"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={label}>分类</label>
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>优先级</label>
          <select style={selectStyle} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={label}>状态</label>
          <select style={selectStyle} value={status} onChange={e => setStatus(e.target.value as Status)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>截止日期</label>
          <input type="date" style={inputStyle} value={deadline} onChange={e => setDeadline(e.target.value)}
            onFocus={e => e.currentTarget.style.colorScheme = 'dark'}
          />
        </div>
      </div>

      <div>
        <label style={label}>优先级颜色</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(PRIORITY_COLORS).map(([key, c]) => (
            <button key={key} type="button" onClick={() => setColor(c)}
              style={{
                width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.1s',
              }} />
          ))}
          {COLORS.filter(c => !Object.values(PRIORITY_COLORS).includes(c)).map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{
                width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.1s',
              }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button
          type="submit"
          style={{
            flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: 500,
            background: '#5e6ad2', color: '#fff', border: 'none', cursor: 'pointer',
            transition: 'filter 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{initial ? '保存' : '创建'}</button>
        <button
          type="button" onClick={onCancel}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13,
            background: 'rgba(var(--on),0.05)', color: 'var(--text-muted)',
            border: '1px solid rgba(var(--on),0.08)', cursor: 'pointer',
            transition: 'filter 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >取消</button>
      </div>
    </form>
  )
}
