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
    <div className="w-72 shrink-0 h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">工作日志</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {activeTask
            ? <span className="text-blue-500 font-medium truncate block">📌 {activeTask.title}</span>
            : '今日记录'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {displayed.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-6">
            {activeTask ? '该任务暂无日志' : '今天还没有日志记录'}
          </div>
        ) : (
          displayed.map(entry => {
            const taskTitle = !activeTaskId ? getTaskTitle(entry.taskId) : null
            return (
              <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                {taskTitle && (
                  <div className="text-xs text-blue-500 mb-1 font-medium truncate">{taskTitle}</div>
                )}
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
                <div className="text-xs text-gray-400 mt-1.5 text-right">{formatDateTime(entry.createdAt)}</div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
        {activeTask && (
          <div className="text-xs text-blue-500 mb-1.5 truncate">关联到: {activeTask.title}</div>
        )}
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
          placeholder={activeTask ? `记录「${activeTask.title}」的进展…` : '记录工作进展… (Enter 提交)'}
          rows={3}
          className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 text-sm transition-colors">
          记录
        </button>
      </form>
    </div>
  )
}
