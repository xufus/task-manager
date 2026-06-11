import type { Task } from '../types'

interface Props {
  tasks: Task[]
  onGenerateSummary: () => void
  onGenerateWeekly: () => void
  generating: boolean
}

export default function StatsBar({ tasks, onGenerateSummary, onGenerateWeekly, generating }: Props) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length
  const rate = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="h-12 shrink-0 flex items-center gap-4 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">任务管理</div>

      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>共 <strong className="text-gray-800 dark:text-gray-100">{total}</strong> 个任务</span>
        <span>进行中 <strong className="text-blue-600">{inProgress}</strong></span>
        <span>已完成 <strong className="text-green-600">{done}</strong></span>
        {overdue > 0 && <span className="text-red-500 font-medium">逾期 {overdue}</span>}
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
          </div>
          <span className="text-xs text-gray-500">{rate}%</span>
        </div>
      )}

      <div className="ml-auto flex gap-2">
        <button
          onClick={onGenerateSummary}
          disabled={generating}
          className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {generating ? '生成中…' : 'AI 日报'}
        </button>
        <button
          onClick={onGenerateWeekly}
          disabled={generating}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {generating ? '生成中…' : 'AI 周报'}
        </button>
      </div>
    </div>
  )
}
