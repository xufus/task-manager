import { useState } from 'react'
import type { Task, Priority, Status } from '../types'
import { PRIORITIES, STATUSES, COLORS, CATEGORIES } from '../constants'

interface Props {
  initial?: Partial<Task>
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [color, setColor] = useState(initial?.color ?? COLORS[5])
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'normal')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'todo')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description, category, color, priority, status, deadline: deadline || null })
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">标题 *</label>
        <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="任务标题" autoFocus />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">描述</label>
        <textarea className={inputCls + ' resize-none'} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="任务描述（可选）" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">分类</label>
          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">优先级</label>
          <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">状态</label>
          <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as Status)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">截止日期</label>
          <input type="date" className={inputCls} value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">颜色标签</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-125' : ''}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors">
          {initial ? '保存' : '创建'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-2 text-sm transition-colors text-gray-700 dark:text-gray-300">
          取消
        </button>
      </div>
    </form>
  )
}
