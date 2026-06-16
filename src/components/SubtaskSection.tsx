import { useState } from 'react'
import type { SubTask } from '../types'

interface Props {
  subtasks: SubTask[]
  onChange: (next: SubTask[]) => void
}

// Linear 风格方形复选框：未选=描边，已选=绿色填充 + 白色对勾（对勾路径沿用 StatusIcon）。
function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 16, height: 16, flexShrink: 0, padding: 0, borderRadius: 4, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? '#00c853' : 'transparent',
        border: `1.5px solid ${checked ? '#00c853' : 'rgba(var(--on),0.25)'}`,
        transition: 'background 0.1s, border-color 0.1s',
      }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M3.2 6.2L5.1 8.1L8.8 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function SubtaskRow({ item, onToggle, onDelete }: { item: SubTask; onToggle: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 2px' }}
    >
      <Checkbox checked={item.done} onClick={onToggle} />
      <span style={{
        flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4,
        color: item.done ? 'var(--text-muted)' : 'var(--text)',
        textDecoration: item.done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{item.title}</span>
      <button
        type="button"
        onClick={onDelete}
        title="删除子任务"
        style={{
          flexShrink: 0, width: 18, height: 18, padding: 0, borderRadius: 4, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', color: 'var(--text-faint)',
          fontSize: 14, lineHeight: 1,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.12s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
      >✕</button>
    </div>
  )
}

export default function SubtaskSection({ subtasks, onChange }: Props) {
  const [text, setText] = useState('')
  const doneCount = subtasks.filter(s => s.done).length

  function toggle(id: string) {
    onChange(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }
  function remove(id: string) {
    onChange(subtasks.filter(s => s.id !== id))
  }
  function add() {
    const t = text.trim()
    if (!t) return
    onChange([...subtasks, { id: crypto.randomUUID(), title: t, done: false }])
    setText('')
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 6, marginBottom: 16,
      background: 'rgba(var(--on),0.03)', border: '1px solid rgba(var(--on),0.06)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        子任务 ({doneCount}/{subtasks.length})
      </div>

      {subtasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 8 }}>
          {subtasks.map(s => (
            <SubtaskRow key={s.id} item={s} onToggle={() => toggle(s.id)} onDelete={() => remove(s.id)} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="添加子任务…"
          style={{
            flex: 1, padding: '5px 9px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
            background: 'rgba(var(--on),0.04)', border: '1px solid rgba(var(--on),0.1)', color: 'var(--text)',
          }}
        />
        <button
          type="button"
          onClick={add}
          style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.25)',
            color: '#5e6ad2', transition: 'filter 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >添加</button>
      </div>
    </div>
  )
}
