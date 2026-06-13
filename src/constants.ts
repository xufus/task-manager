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

// 分类标签配色：返回小圆点主色 / 文字色 / 胶囊背景色
const CATEGORY_HUES: Record<string, number> = {
  学习: 265, // 紫
  个人: 192, // 青
  健康: 150, // 绿
  其他: 35,  // 琥珀
}

function hueFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

export function categoryStyle(name: string): { dot: string; text: string; bg: string } {
  // 工作：蓝色系（与品牌主色一致）
  if (name === '工作') return { dot: '#5e6ad2', text: '#7b8ce8', bg: 'rgba(94,106,210,0.15)' }
  const h = CATEGORY_HUES[name] ?? hueFromString(name)
  return {
    dot: `hsl(${h}, 55%, 62%)`,
    text: `hsl(${h}, 62%, 72%)`,
    bg: `hsla(${h}, 55%, 55%, 0.15)`,
  }
}
