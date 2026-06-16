import { useState } from 'react'
import type { Task } from '../types'
import { STATUSES } from '../constants'
import TaskForm from './TaskForm'
import StatusIcon from './StatusIcon'
import PriorityTag from './PriorityTag'
import SubtaskSection from './SubtaskSection'

interface Props {
  task: Task | null
  categories: string[]
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function TaskDetail({ task, categories, onUpdate, onDelete, onClose }: Props) {
  const [editing, setEditing] = useState(false)

  if (!task) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        选择一个任务查看详情
      </div>
    )
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  const subtasks = task.subtasks ?? []
  const allSubtasksDone = subtasks.length > 0 && subtasks.every(s => s.done)

  const metaBlock: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 6,
    background: 'rgba(var(--on),0.03)',
    border: '1px solid rgba(var(--on),0.06)',
  }
  const metaLabel: React.CSSProperties = {
    fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
  }

  if (editing) {
    return (
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        <div style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>编辑任务</span>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>取消</button>
          </div>
          <TaskForm initial={task} categories={categories} onSubmit={data => { onUpdate(task.id, data); setEditing(false) }} onCancel={() => setEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
      <div style={{ maxWidth: 480 }}>
        {/* 全部子任务完成提示条 */}
        {allSubtasksDone && task.status !== 'done' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '10px 14px', borderRadius: 6, marginBottom: 16,
            background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)',
          }}>
            <span style={{ fontSize: 13, color: '#00c853' }}>✓ 所有子任务已完成，是否标记此任务为完成？</span>
            <button
              onClick={() => onUpdate(task.id, { status: 'done' })}
              style={{
                flexShrink: 0, padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.35)',
                color: '#00c853', transition: 'filter 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >标记完成</button>
          </div>
        )}

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <div style={{ marginTop: 3 }}>
              <StatusIcon status={task.status} size={16} />
            </div>
            <h2 style={{
              margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.4,
              color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text)',
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
            }}>{task.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.25)',
                color: '#5e6ad2', transition: 'filter 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >编辑</button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '4px 6px' }}
            >✕</button>
          </div>
        </div>

        {task.description && (
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {task.description}
          </p>
        )}

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={metaBlock}>
            <div style={metaLabel}>状态</div>
            <select
              value={task.status}
              onChange={e => onUpdate(task.id, { status: e.target.value as Task['status'] })}
              style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text)', cursor: 'pointer', padding: 0 }}
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div style={metaBlock}>
            <div style={metaLabel}>优先级</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PriorityTag priority={task.priority} />
            </div>
          </div>

          <div style={metaBlock}>
            <div style={metaLabel}>分类</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{task.category}</div>
          </div>

          {task.deadline && (
            <div style={{
              ...metaBlock,
              background: isOverdue ? 'rgba(255,68,68,0.08)' : 'rgba(var(--on),0.03)',
              border: `1px solid ${isOverdue ? 'rgba(255,68,68,0.2)' : 'rgba(var(--on),0.06)'}`,
            }}>
              <div style={metaLabel}>截止日期</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: isOverdue ? '#ff4444' : 'var(--text)' }}>
                {task.deadline}{isOverdue ? ' · 逾期' : ''}
              </div>
            </div>
          )}
        </div>

        {/* 子任务 / 检查清单 */}
        <SubtaskSection
          subtasks={subtasks}
          onChange={next => onUpdate(task.id, { subtasks: next })}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onUpdate(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: task.status === 'done' ? 'rgba(var(--on),0.05)' : 'rgba(0,200,83,0.12)',
              border: `1px solid ${task.status === 'done' ? 'rgba(var(--on),0.1)' : 'rgba(0,200,83,0.25)'}`,
              color: task.status === 'done' ? 'var(--text-muted)' : '#00c853',
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >{task.status === 'done' ? '重新打开' : '标记完成'}</button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
              background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.18)',
              color: '#ff4444', transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >删除</button>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span>创建于 {new Date(task.createdAt).toLocaleString('zh-CN')}</span>
          <span>更新于 {new Date(task.updatedAt).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    </div>
  )
}
