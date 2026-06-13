import { useState, useRef, useEffect } from 'react'
import type { JournalEntry, Task } from '../types'

interface Props {
  entries: JournalEntry[]
  tasks: Task[]
  activeTaskId: string | null
  onAdd: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void
}

export default function Journal({ entries, tasks, activeTaskId, onAdd }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) ?? null : null

  const displayed = activeTaskId
    ? entries.filter(e => e.taskId === activeTaskId)
    : entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayed.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onAdd({ taskId: activeTaskId, content: input.trim() })
    setInput('')
  }

  function getTaskTitle(id: string | null) {
    if (!id) return null
    return tasks.find(t => t.id === id)?.title ?? null
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    const isToday = d.toDateString() === new Date().toDateString()
    const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    return isToday ? time : `${d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} ${time}`
  }

  return (
    <div style={{
      width: 320, flexShrink: 0, height: '100%',
      display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid rgba(var(--on),0.06)',
      background: 'var(--bg-elevated)',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(var(--on),0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          工作日志
        </div>
        <div style={{ fontSize: 11, color: activeTask ? '#5e6ad2' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeTask ? `📌 ${activeTask.title}` : '今日记录'}
        </div>
      </div>

      {/* Entries */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {displayed.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 24px' }}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <rect x="10" y="6" width="22" height="30" rx="3" strokeWidth="1.6" style={{ stroke: 'rgba(var(--on),0.12)' }} />
              <path d="M15 14h12M15 20h12M15 26h7" strokeWidth="1.6" strokeLinecap="round" style={{ stroke: 'rgba(var(--on),0.12)' }} />
            </svg>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
              {activeTask ? '该任务暂无日志' : '今天还没有记录'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
              {activeTask ? '在下方记录该任务的进展' : '在下方记录你的工作进展'}
            </div>
          </div>
        ) : (
          displayed.map((entry, idx) => {
            const taskTitle = !activeTaskId ? getTaskTitle(entry.taskId) : null
            return (
              <div key={entry.id} style={{
                padding: '10px 12px',
                borderBottom: idx < displayed.length - 1 ? '1px solid rgba(var(--on),0.04)' : 'none',
              }}>
                {taskTitle && (
                  <span style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 500,
                    color: '#5e6ad2', background: 'rgba(94,106,210,0.15)',
                    padding: '3px 8px', borderRadius: 4, marginBottom: 6,
                    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {taskTitle}
                  </span>
                )}
                <div style={{ fontSize: 13, color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {entry.content}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5, textAlign: 'right' }}>
                  {formatDateTime(entry.createdAt)}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(var(--on),0.06)' }}>
        {activeTask && (
          <div style={{ fontSize: 11, color: '#5e6ad2', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            关联到: {activeTask.title}
          </div>
        )}
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
          placeholder={activeTask ? `记录「${activeTask.title}」的进展…` : '记录工作进展… (Enter 提交)'}
          rows={2}
          style={{
            width: '100%', height: 40, borderRadius: 6, padding: '7px 9px', fontSize: 13,
            background: 'rgba(var(--on),0.04)',
            border: '1px solid rgba(var(--on),0.08)',
            color: 'var(--text)', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button
            onClick={handleSubmit}
            style={{
              width: 64, height: 34, padding: 0, borderRadius: 6, fontSize: 12,
              fontWeight: 500, background: '#5e6ad2', color: '#fff', border: 'none',
              cursor: 'pointer', transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >记录</button>
        </div>
      </div>
    </div>
  )
}
