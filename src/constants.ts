import type { Priority, Status } from './types'

// 四象限优先级（重要/紧急矩阵）。color = 文字/圆点色，bg/border 用于胶囊标签。
export interface PriorityMeta {
  value: Priority
  short: string   // 'P0'
  label: string   // '重要紧急'
  color: string   // 文字 / 圆点 / 竖线色
  bg: string      // 胶囊背景
  border: string  // 胶囊边框
}

export const PRIORITIES: PriorityMeta[] = [
  { value: 'p0', short: 'P0', label: '重要紧急',   color: '#ff4444', bg: 'rgba(255,80,80,0.15)',  border: 'rgba(255,80,80,0.3)' },
  { value: 'p1', short: 'P1', label: '重要不紧急', color: '#5e6ad2', bg: 'rgba(94,106,210,0.15)', border: 'rgba(94,106,210,0.3)' },
  { value: 'p2', short: 'P2', label: '不重要紧急', color: '#f5a623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.3)' },
  { value: 'p3', short: 'P3', label: '不重要不紧急', color: '#5a9e5a', bg: 'rgba(100,180,100,0.15)', border: 'rgba(100,180,100,0.3)' },
]

export const PRIORITY_META = Object.fromEntries(
  PRIORITIES.map(p => [p.value, p]),
) as Record<Priority, PriorityMeta>

// 旧数据迁移映射：紧急→P0、高→P1、中(普通)→P2、低→P3。
export const LEGACY_PRIORITY: Record<string, Priority> = {
  urgent: 'p0', high: 'p1', normal: 'p2', low: 'p3',
}

// 胶囊全名：「P0: 重要紧急」
export function priorityName(p: Priority): string {
  const m = PRIORITY_META[p]
  return `${m.short}: ${m.label}`
}

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo',        label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done',        label: '完成' },
]

export const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

// Default category set for fresh installs; the live list is user-editable
// and persisted in localStorage (see useAppStore).
export const DEFAULT_CATEGORIES = ['工作']

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
