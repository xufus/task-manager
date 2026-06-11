import { useState } from 'react'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, useDroppable, type DragStartEvent, type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Status } from '../types'
import { PRIORITIES } from '../constants'

const STATUS_NEXT: Record<Status, Status | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
}
const STATUS_PREV: Record<Status, Status | null> = {
  todo: null,
  in_progress: 'todo',
  done: 'in_progress',
}
const STATUS_NEXT_LABEL: Record<Status, string> = {
  todo: '开始',
  in_progress: '完成',
  done: '',
}

const PRIORITY_LABEL: Record<string, string> = { urgent: '紧急', high: '高', normal: '普通', low: '低' }
const PRIORITY_COLOR: Record<string, string> = { urgent: 'text-red-500', high: 'text-orange-500', normal: 'text-blue-500', low: 'text-gray-400' }

interface CardProps {
  task: Task
  isExpanded: boolean
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onExpand: (id: string | null) => void
}

function TaskCard({ task, isExpanded: expanded, onUpdateTask, onDeleteTask, onExpand }: CardProps) {
  function toggleExpand() {
    onExpand(expanded ? null : task.id)
  }
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const priorityColor = PRIORITIES.find(p => p.value === task.priority)?.color ?? 'bg-gray-400'

  const next = STATUS_NEXT[task.status]
  const prev = STATUS_PREV[task.status]
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none">

      {/* 卡片头部：始终可见，点击展开/折叠 */}
      <div className="p-3" onClick={toggleExpand}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: task.color }} />
              <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'} truncate`}>
                {task.title}
              </div>
            </div>
            {!expanded && task.description && (
              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 pl-3.5">{task.description}</div>
            )}
            {!expanded && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap pl-3.5">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">{task.category}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityColor}`} />
                {task.deadline && (
                  <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {task.deadline}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-gray-300 dark:text-gray-600 text-xs shrink-0 mt-0.5">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* 展开详情 */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 whitespace-pre-wrap">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-xs">
            <div className="bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
              <div className="text-gray-400 mb-0.5">分类</div>
              <div className="font-medium text-gray-700 dark:text-gray-300">{task.category}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
              <div className="text-gray-400 mb-0.5">优先级</div>
              <div className={`font-medium ${PRIORITY_COLOR[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</div>
            </div>
            {task.deadline && (
              <div className={`rounded px-2 py-1.5 col-span-2 ${isOverdue ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="text-gray-400 mb-0.5">截止日期</div>
                <div className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {task.deadline}{isOverdue ? ' (已逾期)' : ''}
                </div>
              </div>
            )}
          </div>

          {/* 状态切换 + 删除 */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {prev && (
              <button
                onClick={() => onUpdateTask(task.id, { status: prev })}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >← 撤回</button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-1.5 py-1 rounded transition-colors"
            >删除</button>
            {next && (
              <button
                onClick={() => onUpdateTask(task.id, { status: next })}
                className={`text-xs px-2 py-1 rounded transition-colors font-medium
                  ${next === 'done'
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'}`}
              >{STATUS_NEXT_LABEL[task.status]} →</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Column({ status, label, tasks, expandedId, onUpdateTask, onDeleteTask, onExpand }: {
  status: Status; label: string; tasks: Task[]; expandedId: string | null; onUpdateTask: (id: string, updates: Partial<Task>) => void; onDeleteTask: (id: string) => void; onExpand: (id: string | null) => void
}) {
  const { setNodeRef } = useDroppable({ id: status })

  const bgMap: Record<Status, string> = {
    todo: 'bg-gray-50 dark:bg-gray-900',
    in_progress: 'bg-blue-50 dark:bg-blue-950/30',
    done: 'bg-green-50 dark:bg-green-950/20',
  }
  const headerMap: Record<Status, string> = {
    todo: 'text-gray-600 dark:text-gray-400',
    in_progress: 'text-blue-600 dark:text-blue-400',
    done: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className={`flex-1 rounded-xl ${bgMap[status]} p-3 min-w-0 flex flex-col`}>
      <div className={`text-sm font-semibold ${headerMap[status]} mb-2 flex items-center gap-1.5`}>
        {label}
        <span className="text-xs font-normal bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 text-gray-500">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-16">
          {tasks.map(t => <TaskCard key={t.id} task={t} isExpanded={expandedId === t.id} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} onExpand={onExpand} />)}
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

  const columns: { status: Status; label: string }[] = [
    { status: 'todo', label: '待办' },
    { status: 'in_progress', label: '进行中' },
    { status: 'done', label: '完成' },
  ]

  const byStatus = (s: Status) => tasks.filter(t => t.status === s)

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Dropped onto a column container (droppable id = status string)
    const isColumnDrop = columns.some(c => c.status === over.id)
    if (isColumnDrop) {
      const targetStatus = over.id as Status
      if (activeTask.status !== targetStatus) {
        onUpdateTask(activeTask.id, { status: targetStatus })
      }
      return
    }

    // Dropped onto another card
    const overTask = tasks.find(t => t.id === over.id)
    if (!overTask) return

    if (activeTask.status === overTask.status) {
      // Same column — reorder
      const colTasks = byStatus(activeTask.status)
      const oldIdx = colTasks.findIndex(t => t.id === active.id)
      const newIdx = colTasks.findIndex(t => t.id === over.id)
      if (oldIdx !== newIdx) {
        const reordered = arrayMove(colTasks, oldIdx, newIdx)
        const others = tasks.filter(t => t.status !== activeTask.status)
        onReorder([...others, ...reordered])
      }
    } else {
      // Different column — move
      onUpdateTask(activeTask.id, { status: overTask.status })
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 h-full overflow-hidden">
        {columns.map(col => (
          <Column key={col.status} status={col.status} label={col.label} tasks={byStatus(col.status)} expandedId={expandedId} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} onExpand={handleExpand} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-blue-400 opacity-90">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{activeTask.title}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
