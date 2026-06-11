import { useState } from 'react'
import type { Task } from '../types'
import { PRIORITIES, STATUSES } from '../constants'
import TaskForm from './TaskForm'

interface Props {
  task: Task | null
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function TaskDetail({ task, onUpdate, onDelete, onClose }: Props) {
  const [editing, setEditing] = useState(false)

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        选择一个任务查看详情
      </div>
    )
  }

  const priority = PRIORITIES.find(p => p.value === task.priority)
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  if (editing) {
    return (
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">编辑任务</h2>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">取消</button>
          </div>
          <TaskForm
            initial={task}
            onSubmit={data => { onUpdate(task.id, data); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="max-w-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ background: task.color }} />
            <h2 className={`font-semibold text-lg ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
              {task.title}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setEditing(true)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 border border-blue-200 rounded transition-colors">编辑</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm px-2">✕</button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">状态</div>
            <select
              value={task.status}
              onChange={e => onUpdate(task.id, { status: e.target.value as Task['status'] })}
              className="text-sm font-medium text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none w-full"
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">优先级</div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${priority?.color}`} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{priority?.label}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">分类</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{task.category}</div>
          </div>
          {task.deadline && (
            <div className={`rounded-lg p-3 ${isOverdue ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="text-xs text-gray-400 mb-1">截止日期</div>
              <div className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {task.deadline} {isOverdue && '(已逾期)'}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${task.status === 'done' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {task.status === 'done' ? '重新打开' : '标记完成'}
          </button>
          <button onClick={() => onDelete(task.id)} className="px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
            删除
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div>创建于 {new Date(task.createdAt).toLocaleString('zh-CN')}</div>
          <div>更新于 {new Date(task.updatedAt).toLocaleString('zh-CN')}</div>
        </div>
      </div>
    </div>
  )
}
