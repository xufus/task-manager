import type { Priority, Status } from './types'

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: '紧急', color: 'bg-red-500' },
  { value: 'high',   label: '高',   color: 'bg-orange-500' },
  { value: 'normal', label: '普通', color: 'bg-blue-500' },
  { value: 'low',    label: '低',   color: 'bg-gray-400' },
]

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo',        label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done',        label: '完成' },
]

export const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

export const CATEGORIES = ['工作', '学习', '个人', '健康', '其他']
