import type { Task, JournalEntry } from './types'

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`)
  }

  const data = await res.json() as { content: { type: string; text: string }[] }
  return data.content.find(c => c.type === 'text')?.text ?? ''
}

export async function generateDailySummary(
  apiKey: string,
  tasks: Task[],
  journalEntries: JournalEntry[]
): Promise<string> {
  const today = new Date().toLocaleDateString('zh-CN')
  const todayDate = new Date().toDateString()

  const todayEntries = journalEntries.filter(e => new Date(e.createdAt).toDateString() === todayDate)
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const prompt = `你是一个工作助手。请根据以下信息生成今日（${today}）工作日报。

## 任务状态
- 待办/进行中任务（${activeTasks.length}个）：
${activeTasks.map(t => `  - [${t.status === 'in_progress' ? '进行中' : '待办'}] ${t.title}（${t.priority}优先级）${t.deadline ? `，截止${t.deadline}` : ''}`).join('\n') || '  无'}

- 已完成任务（${doneTasks.length}个）：
${doneTasks.map(t => `  - ${t.title}`).join('\n') || '  无'}

## 今日日志记录（${todayEntries.length}条）
${todayEntries.map(e => `- ${new Date(e.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}：${e.content}`).join('\n') || '今日暂无日志记录'}

请生成一份简洁专业的日报，包含：
1. 今日完成事项总结
2. 工作内容分布（按分类/优先级）
3. 待跟进事项
4. 改进建议（如有）

用中文回答，语言自然流畅，不超过400字。`

  return callClaude(apiKey, prompt)
}

export async function generateWeeklyReport(
  apiKey: string,
  tasks: Task[],
  journalEntries: JournalEntry[]
): Promise<string> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const weekEntries = journalEntries.filter(e => new Date(e.createdAt) >= weekAgo)
  const completedThisWeek = tasks.filter(t => t.status === 'done' && new Date(t.updatedAt) >= weekAgo)

  const prompt = `你是一个工作助手。请根据以下信息生成本周工作周报（${weekAgo.toLocaleDateString('zh-CN')} ~ ${now.toLocaleDateString('zh-CN')}）。

## 本周完成任务（${completedThisWeek.length}个）
${completedThisWeek.map(t => `- ${t.title}（${t.category}，${t.priority}优先级）`).join('\n') || '无'}

## 当前任务状态
- 进行中：${tasks.filter(t => t.status === 'in_progress').length}个
- 待办：${tasks.filter(t => t.status === 'todo').length}个

## 本周日志摘要（${weekEntries.length}条）
${weekEntries.slice(-20).map(e => `- ${new Date(e.createdAt).toLocaleDateString('zh-CN')}：${e.content}`).join('\n') || '本周暂无日志记录'}

请生成一份专业的周报，包含：
1. 本周主要成果
2. 工作亮点与挑战
3. 时间分配分析
4. 下周工作重点建议

用中文回答，结构清晰，不超过600字。`

  return callClaude(apiKey, prompt)
}
