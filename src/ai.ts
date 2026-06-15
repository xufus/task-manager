import type { Task, JournalEntry } from './types'
import { PRIORITY_META } from './constants'

// DeepSeek 采用 OpenAI 兼容接口（chat/completions）。
async function callLLM(apiKey: string, prompt: string, maxTokens = 1500): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`)
  }

  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}

export async function generateDailySummary(
  apiKey: string,
  tasks: Task[],
  journalEntries: JournalEntry[]
): Promise<string> {
  const now = new Date()
  const todayStr = now.toLocaleDateString('zh-CN')
  const todayKey = now.toDateString()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const taskById = new Map(tasks.map(t => [t.id, t]))
  const statusLabel = (s: Task['status']) => s === 'done' ? '已完成' : s === 'in_progress' ? '进行中' : '待办'

  const fmtTask = (t: Task) => {
    const m = PRIORITY_META[t.priority]
    const dl = t.deadline ? `，截止 ${t.deadline}` : ''
    const overdue = t.deadline && new Date(t.deadline) < startOfToday && t.status !== 'done' ? '（已逾期）' : ''
    return `- ${t.title}｜${m.short} ${m.label}｜分类:${t.category}｜状态:${statusLabel(t.status)}${dl}${overdue}`
  }

  // 今日相关任务：进行中/待办 + 今日完成的。
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const doneToday = tasks.filter(t => t.status === 'done' && new Date(t.updatedAt).toDateString() === todayKey)
  const todayTasks = [...activeTasks, ...doneToday]

  // 按分类统计各状态数量，便于模型准确计算完成率。
  const catStats = new Map<string, { total: number; done: number; doing: number; todo: number }>()
  for (const t of tasks) {
    const c = catStats.get(t.category) ?? { total: 0, done: 0, doing: 0, todo: 0 }
    c.total++
    if (t.status === 'done') c.done++
    else if (t.status === 'in_progress') c.doing++
    else c.todo++
    catStats.set(t.category, c)
  }
  const catStatsText = [...catStats.entries()]
    .map(([cat, s]) => `- ${cat}：完成 ${s.done}/${s.total}（进行中 ${s.doing}、待办 ${s.todo}）`)
    .join('\n') || '- 暂无任务'

  // 今日日志（附关联任务的分类/名称）。
  const todayEntries = journalEntries.filter(e => new Date(e.createdAt).toDateString() === todayKey)
  const fmtEntry = (e: JournalEntry) => {
    const time = new Date(e.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const t = e.taskId ? taskById.get(e.taskId) : null
    const rel = t ? `[${t.category}/${t.title}]` : '[无关联任务]'
    return `- ${time} ${rel} ${e.content}`
  }
  const journalText = todayEntries.map(fmtEntry).join('\n') || '今日暂无日志记录'

  // 各分类日志条目数（用于工作占比估算）。
  const entryByCat = new Map<string, number>()
  for (const e of todayEntries) {
    const t = e.taskId ? taskById.get(e.taskId) : null
    const c = t ? t.category : '未分类'
    entryByCat.set(c, (entryByCat.get(c) ?? 0) + 1)
  }
  const entryByCatText = [...entryByCat.entries()]
    .map(([cat, n]) => `- ${cat}：${n} 条`)
    .join('\n') || '- 今日暂无日志'

  // 昨日遗留：今天之前创建、至今仍未完成的任务。
  const yesterdayPending = tasks.filter(t => t.status !== 'done' && new Date(t.createdAt) < startOfToday)
  const yesterdayText = yesterdayPending.map(fmtTask).join('\n') || '无遗留任务'

  const tasksSummary = `今日相关任务（${todayTasks.length} 个）：
${todayTasks.map(fmtTask).join('\n') || '- 无'}

按分类完成情况：
${catStatsText}`

  const journalSummary = `日志条目（${todayEntries.length} 条）：
${journalText}

各分类日志条目数：
${entryByCatText}`

  const prompt = `你是一个工作效率分析助手。请根据以下数据生成今日（${todayStr}）工作日报。

【今日任务数据】
${tasksSummary}

【今日工作日志】
${journalSummary}

【昨日遗留任务】
${yesterdayText}

请用中文输出，使用 Markdown 格式：每个章节标题用「## 」开头，正文用「- 」列表或短段落，关键信息用 **加粗**。严格按以下结构输出：

## 📊 今日概览
- 任务完成率：按分类分别统计（例：工作 2/3、学习 1/1）
- 各分类工作占比：根据日志条目数量估算

## ✅ 今日完成
按分类列出今日完成的任务，每项附简短说明（从日志中提取关键信息）

## 🔄 进行中
列出进行中的任务，结合日志说明当前进展与下一步

## ⚠️ 待办及风险
- 重点标注逾期或今日未推进的 P0/P1 任务
- 截止日期临近的任务预警

## 💡 效率分析
结合日志分析：今日工作节奏是否合理；是否存在任务切换过于频繁；P0/P1 重要紧急任务是否得到优先处理

## 📋 明日建议
根据今日进展，给出明日优先处理顺序的具体建议

要求：分析须结合具体任务名、分类与日志内容，避免空泛套话；某章节确无数据时如实说明。`

  return callLLM(apiKey, prompt, 2500)
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
${completedThisWeek.map(t => `- ${t.title}（${t.category}，${PRIORITY_META[t.priority].label}）`).join('\n') || '无'}

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

  return callLLM(apiKey, prompt)
}
