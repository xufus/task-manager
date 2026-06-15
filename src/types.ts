export type Priority = 'p0' | 'p1' | 'p2' | 'p3'
export type Status = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  category: string
  color: string
  priority: Priority
  status: Status
  deadline: string | null
  createdAt: string
  updatedAt: string
  order: number
}

// 新建任务时由 store 自动生成 id/时间戳/order，调用方无需提供这些字段。
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>

export interface JournalEntry {
  id: string
  taskId: string | null
  content: string
  createdAt: string
}

export interface DailySummary {
  id: string
  date: string
  content: string
  generatedAt: string
}

export interface WeeklySummary {
  id: string
  weekStart: string
  weekEnd: string
  content: string
  generatedAt: string
}

export interface AppSettings {
  apiKey: string
  theme: 'light' | 'dark' | 'system'
}
