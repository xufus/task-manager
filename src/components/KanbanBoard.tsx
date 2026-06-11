import { useState } from 'react'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, useDroppable, type DragStartEvent, type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Status, Priority } from '../types'
import StatusIcon from './StatusIcon'

const STATUS_NEXT: Record<Status, Status | null> = {
  todo: 'in_progress', in_progress: 'done', done: null,
}
const STATUS_PREV: Record<Status, Status | null> = {
  todo: null, in_progress: 'todo', done: 'in_progress',
}
const STATUS_NEXT_LABEL: Record<Status, string> = {
  todo: '开始', in_progress: '完成', done: '',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ff4444', high: '#f5a623', normal: '#5e6ad2', low: '#8a8a9a',
}
const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: '紧急', high: '高', normal: '普通', low: '低',
}

interface CardProps {
  task: Task
  isExpanded: boolean
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onExpand: (id: string | null) => void
}

function TaskCard({ task, isExpanded: expanded, onUpdateTask, onDeleteTask, onExpand }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  function toggleExpand() { onExpand(expanded ? null : task.id) }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }

  const next = STATUS_NEXT[task.status]
  const prev = STATUS_PREV[task.status]
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  const borderColor = expanded ? 'rgba(94,106,210,0.35)' : isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: '#1a1a24',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
        borderRadius: 6,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'border-color 0.1s, opacity 0.15s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
      {...listeners}
    >
      {/* Header — always visible */}
      <div
        style={{ padding: '9px 10px', display: 'flex', alignItems: 'flex-start', gap: 8 }}
        onClick={toggleExpand}
      >
        <div style={{ marginTop: 1, flexShrink: 0 }}>
          <StatusIcon status={task.status} size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500,
            color: task.status === 'done' ? '#8a8a9a' : '#e2e2e8',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{task.title}</div>

          {!expanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
              {task.description && (
                <span style={{ fontSize: 11, color: '#8a8a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                  {task.description}
                </span>
              )}
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#8a8a9a', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>{task.category}</span>
              {task.deadline && (
                <span style={{ fontSize: 11, color: isOverdue ? '#ff4444' : '#8a8a9a' }}>{task.deadline}</span>
              )}
            </div>
          )}
        </div>
        <span style={{ color: '#8a8a9a', fontSize: 10, flexShrink: 0, marginTop: 2, opacity: 0.6 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{ padding: '0 10px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          onClick={e => e.stopPropagation()}
        >
          {task.description && (
            <p style={{ fontSize: 12, color: '#8a8a9a', marginTop: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {task.description}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
            <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>分类</div>
              <div style={{ fontSize: 12, color: '#e2e2e8', fontWeight: 500 }}>{task.category}</div>
            </div>
            <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>优先级</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: PRIORITY_COLORS[task.priority] }}>
                {PRIORITY_LABELS[task.priority]}
              </div>
            </div>
            {task.deadline && (
              <div style={{
                padding: '6px 8px', borderRadius: 6, gridColumn: '1 / -1',
                background: isOverdue ? 'rgba(255,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isOverdue ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <div style={{ fontSize: 10, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>截止日期</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: isOverdue ? '#ff4444' : '#e2e2e8' }}>
                  {task.deadline}{isOverdue ? ' · 已逾期' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            {prev && (
              <button
                onClick={() => onUpdateTask(task.id, { status: prev })}
                style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8a8a9a', transition: 'filter 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >← 撤回</button>
            )}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => onDeleteTask(task.id)}
              style={{
                padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.15)',
                color: '#ff4444', transition: 'filter 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >删除</button>
            {next && (
              <button
                onClick={() => onUpdateTask(task.id, { status: next })}
                style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  background: next === 'done' ? 'rgba(0,200,83,0.1)' : 'rgba(94,106,210,0.15)',
                  border: `1px solid ${next === 'done' ? 'rgba(0,200,83,0.25)' : 'rgba(94,106,210,0.3)'}`,
                  color: next === 'done' ? '#00c853' : '#5e6ad2',
                  transition: 'filter 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >{STATUS_NEXT_LABEL[task.status]} →</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyColumn() {
  const [btnHovered, setBtnHovered] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 24 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <span style={{ fontSize: 12, color: '#666680' }}>暂无任务</span>
      <button
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          marginTop: 4, padding: '5px 14px', borderRadius: 6, fontSize: 12,
          background: 'transparent',
          border: btnHovered ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
          color: btnHovered ? '#e2e2e8' : '#666680',
          cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
        }}
      >+ 添加任务</button>
    </div>
  )
}

const COLUMN_STYLES: Record<Status, { bg: string; accent: string; label: string }> = {
  todo:        { bg: 'rgba(255,255,255,0.02)', accent: '#8a8a9a', label: '待办' },
  in_progress: { bg: 'rgba(94,106,210,0.04)', accent: '#5e6ad2', label: '进行中' },
  done:        { bg: 'rgba(0,200,83,0.03)',   accent: '#00c853', label: '完成' },
}

function Column({ status, tasks, expandedId, onUpdateTask, onDeleteTask, onExpand }: {
  status: Status; tasks: Task[]; expandedId: string | null
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onExpand: (id: string | null) => void
}) {
  const { setNodeRef } = useDroppable({ id: status })
  const col = COLUMN_STYLES[status]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      background: col.bg,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6, padding: '10px 8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '0 2px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: col.accent, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: col.accent }}>{col.label}</span>
        <span style={{
          fontSize: 11, color: '#8a8a9a',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '1px 6px',
        }}>{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, overflowY: 'auto', minHeight: 60 }}>
          {tasks.length === 0 ? (
            <EmptyColumn />
          ) : (
            tasks.map(t => (
              <TaskCard
                key={t.id} task={t}
                isExpanded={expandedId === t.id}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onExpand={onExpand}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface Props {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onReorder: (tasks: Task[]) => void
  onDeleteTask: (id: string) => void
  onTaskExpand: (id: string | null) => void
}

export default function KanbanBoard({ tasks, onUpdateTask, onReorder, onDeleteTask, onTaskExpand }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleExpand(id: string | null) {
    setExpandedId(id)
    onTaskExpand(id)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const columns: { status: Status }[] = [
    { status: 'todo' }, { status: 'in_progress' }, { status: 'done' },
  ]

  const byStatus = (s: Status) => tasks.filter(t => t.status === s)

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const isColumnDrop = columns.some(c => c.status === over.id)
    if (isColumnDrop) {
      if (activeTask.status !== over.id) onUpdateTask(activeTask.id, { status: over.id as Status })
      return
    }

    const overTask = tasks.find(t => t.id === over.id)
    if (!overTask) return

    if (activeTask.status === overTask.status) {
      const colTasks = byStatus(activeTask.status)
      const oldIdx = colTasks.findIndex(t => t.id === active.id)
      const newIdx = colTasks.findIndex(t => t.id === over.id)
      if (oldIdx !== newIdx) {
        const reordered = arrayMove(colTasks, oldIdx, newIdx)
        onReorder([...tasks.filter(t => t.status !== activeTask.status), ...reordered])
      }
    } else {
      onUpdateTask(activeTask.id, { status: overTask.status })
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 10, height: '100%', overflow: 'hidden' }}>
        {columns.map(col => (
          <Column
            key={col.status} status={col.status}
            tasks={byStatus(col.status)}
            expandedId={expandedId}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onExpand={handleExpand}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div style={{
            background: '#1a1a24', border: '1px solid rgba(94,106,210,0.5)',
            borderRadius: 6, padding: '9px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 13, color: '#e2e2e8' }}>{activeTask.title}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
