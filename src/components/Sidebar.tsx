import { useState } from 'react'
import type { Task, Priority, Status } from '../types'
import { PRIORITIES, STATUSES, CATEGORIES } from '../constants'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
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

  const priorityColor: Record<Priority, string> = {
    urgent: 'bg-red-500', high: 'bg-orange-500', normal: 'bg-blue-500', low: 'bg-gray-400'
  }

  const statusLabel: Record<Status, string> = {
    todo: '待办', in_progress: '进行中', done: '完成'
  }

  const selCls = 'rounded px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none'

  return (
    <div className="w-72 shrink-0 h-full flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">任务列表</span>
          <button onClick={() => setShowForm(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 transition-colors">
            + 新建
          </button>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索任务…"
          className="w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1.5">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | 'all')} className={selCls}>
          <option value="all">全部状态</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selCls}>
          <option value="all">全部分类</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')} className={selCls}>
          <option value="all">全部优先级</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">暂无任务</div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              onClick={() => onSelect(task.id)}
              className={`px-3 py-2.5 cursor-pointer border-b border-gray-100 dark:border-gray-800 flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedId === task.id ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
            >
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: task.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'} text-sm font-medium truncate`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityColor[task.priority]}`} />
                  <span className="text-xs text-gray-400">{statusLabel[task.status]}</span>
                  {task.deadline && (
                    <span className={`text-xs ${new Date(task.deadline) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>
                      · {task.deadline}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(task.id) }}
                className="text-gray-300 hover:text-red-500 text-xs shrink-0 transition-colors"
              >✕</button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-5 w-96 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">新建任务</h2>
            <TaskForm onSubmit={data => { onAdd(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
