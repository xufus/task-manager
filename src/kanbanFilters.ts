import type { Task, Priority } from './types'

export type SortKey =
  | 'default'
  | 'priority-desc'
  | 'priority-asc'
  | 'deadline-asc'
  | 'deadline-desc'
  | 'created-desc'
  | 'created-asc'

export type DueFilter = 'all' | 'today' | 'week' | 'overdue'

export interface KanbanFilters {
  priorities: Priority[]
  categories: string[]
  due: DueFilter
  sort: SortKey
}

export const EMPTY_FILTERS: KanbanFilters = {
  priorities: [],
  categories: [],
  due: 'all',
  sort: 'default',
}

export const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 3, high: 2, normal: 1, low: 0,
}

const VALID_PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low']
const VALID_DUE: DueFilter[] = ['all', 'today', 'week', 'overdue']
const VALID_SORT: SortKey[] = [
  'default', 'priority-desc', 'priority-asc',
  'deadline-asc', 'deadline-desc', 'created-desc', 'created-asc',
]

/** 仅统计筛选条件数量（不含排序），用于按钮高亮与角标。 */
export function activeFilterCount(f: KanbanFilters): number {
  return f.priorities.length + f.categories.length + (f.due !== 'all' ? 1 : 0)
}

/** 当天 0 点（本地时区）。 */
function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** 本周周日 23:59:59.999（周一为周首）。 */
function endOfWeek(): Date {
  const d = startOfToday()
  // getDay(): 0=周日 … 6=周六；以周一为周首，距本周日的天数：
  const daysUntilSunday = (7 - d.getDay()) % 7
  d.setDate(d.getDate() + daysUntilSunday)
  d.setHours(23, 59, 59, 999)
  return d
}

function matchesDue(task: Task, due: DueFilter): boolean {
  if (due === 'all') return true
  if (!task.deadline) return false
  const dl = new Date(task.deadline)
  const today = startOfToday()
  switch (due) {
    case 'today': {
      const d = new Date(dl)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    }
    case 'week':
      return dl >= today && dl <= endOfWeek()
    case 'overdue':
      return dl < today && task.status !== 'done'
  }
}

export function matchesFilters(task: Task, f: KanbanFilters): boolean {
  if (f.priorities.length && !f.priorities.includes(task.priority)) return false
  if (f.categories.length && !f.categories.includes(task.category)) return false
  return matchesDue(task, f.due)
}

/** 返回排序后的新数组，不修改入参。default 保留原有（手动拖拽）顺序。 */
export function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  if (sort === 'default') return tasks
  const out = [...tasks]
  // deadline 为空者恒排末尾，方向通过 dir 控制（asc/desc 仅影响有值者）。
  const byDeadline = (dir: 1 | -1) => (a: Task, b: Task) => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return dir * (new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }
  switch (sort) {
    case 'priority-desc':
      out.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
      break
    case 'priority-asc':
      out.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
      break
    case 'deadline-asc':
      out.sort(byDeadline(1))
      break
    case 'deadline-desc':
      out.sort(byDeadline(-1))
      break
    case 'created-desc':
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case 'created-asc':
      out.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      break
  }
  return out
}

/** 序列化到 URLSearchParams，默认值不写入以保持地址干净。 */
export function filtersToParams(f: KanbanFilters): URLSearchParams {
  const sp = new URLSearchParams()
  if (f.priorities.length) sp.set('pri', f.priorities.join(','))
  if (f.categories.length) sp.set('cat', f.categories.map(encodeURIComponent).join(','))
  if (f.due !== 'all') sp.set('due', f.due)
  if (f.sort !== 'default') sp.set('sort', f.sort)
  return sp
}

/** 从 URLSearchParams 解析，非法值回退到默认。 */
export function filtersFromParams(sp: URLSearchParams): KanbanFilters {
  const priorities = (sp.get('pri') ?? '')
    .split(',')
    .filter((v): v is Priority => VALID_PRIORITIES.includes(v as Priority))
  const categories = (sp.get('cat') ?? '')
    .split(',')
    .filter(Boolean)
    .map(decodeURIComponent)
  const dueRaw = sp.get('due') as DueFilter | null
  const sortRaw = sp.get('sort') as SortKey | null
  return {
    priorities,
    categories,
    due: dueRaw && VALID_DUE.includes(dueRaw) ? dueRaw : 'all',
    sort: sortRaw && VALID_SORT.includes(sortRaw) ? sortRaw : 'default',
  }
}
