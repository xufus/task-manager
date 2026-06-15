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
}

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
