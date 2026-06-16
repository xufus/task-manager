import type { Task, JournalEntry, Status } from './types'
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

const pad = (n: number) => String(n).padStart(2, '0')
const statusLabel = (s: Status) => (s === 'done' ? '完成' : s === 'in_progress' ? '进行中' : '待办')
// 任务一行：标题（优先级，[分类]）[，截止YYYY-MM-DD]
const taskLine = (t: Task, withCategory = true) =>
  `${t.title}（${PRIORITY_META[t.priority].label}${withCategory ? `，${t.category}` : ''}）${t.deadline ? `，截止${t.deadline}` : ''}`

export async function generateDailySummary(
  apiKey: string,
  tasks: Task[],
  journalEntries: JournalEntry[]
): Promise<string> {
  const now = new Date()
  const todayLabel = now.toLocaleDateString('zh-CN')
  const todayStr = now.toDateString()
  const todayYmd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const isToday = (d: string) => new Date(d).toDateString() === todayStr
  const taskTitle = new Map(tasks.map(t => [t.id, t.title]))

  // 今日任务数据 = 今日有动态（创建/更新/截止）∪ 当前所有待办，按 id 去重。
  const seen = new Set<string>()
  const todayTasks = tasks.filter(t => {
    if (seen.has(t.id)) return false
    const hit = isToday(t.createdAt) || isToday(t.updatedAt) || t.deadline === todayYmd || t.status === 'todo'
    if (hit) seen.add(t.id)
    return hit
  })
  const tasksSummary = todayTasks.length
    ? todayTasks.map(t => `- [${statusLabel(t.status)}] ${taskLine(t)}`).join('\n')
    : '无'

  // 今日工作日志 = 今日条目（时间 + 内容 + 关联任务）。
  const todayEntries = journalEntries.filter(e => isToday(e.createdAt))
  const journalText = todayEntries.length
    ? todayEntries.map(e => {
        const time = new Date(e.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        const rel = e.taskId ? (taskTitle.get(e.taskId) ?? '已删除任务') : '无关联'
        return `- ${time} ${e.content}（关联：${rel}）`
      }).join('\n')
    : '今日暂无日志记录'

  // 当前所有进行中任务（不限日期）。
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const inProgressText = inProgress.length
    ? inProgress.map(t => `- ${taskLine(t)}`).join('\n')
    : '无'

  const prompt = `你是一个工作汇报助手。根据以下数据生成今日（${todayLabel}）工作日报。

【今日任务数据】
${tasksSummary}

【今日工作日志】
${journalText}

【当前所有进行中任务】
${inProgressText}

生成要求：
- 总字数控制在 200 字以内
- 每条内容用动词开头（完成/修复/调研/输出/联调/推进/确认）
- 技术细节后面加一句结论或影响
- 区分事实（已发生）和判断（风险预判）
- 语言简洁，上级能一眼看懂

请严格按以下格式输出，不要增减章节：

## 今日完成
- [动词] 具体事项，结果/影响是什么
（如无完成项，写"暂无已完成任务"）

## 进行中
- [任务名] 当前进展，预计完成时间
（如无，省略此章节）

## 明日计划
- [P0/P1/P2] [动词] 具体可执行的任务
（按优先级排列，最多列 3 条）

## 问题与阻塞
- [阻塞事实] 需要谁协助或如何解决
（如无阻塞，写"暂无"）`

  return callLLM(apiKey, prompt)
}

export async function generateWeeklyReport(
  apiKey: string,
  tasks: Task[],
  journalEntries: JournalEntry[]
): Promise<string> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const rangeLabel = `${weekAgo.toLocaleDateString('zh-CN')} ~ ${now.toLocaleDateString('zh-CN')}`

  // 本周任务集 = 近 7 天创建/更新的任务 ∪ 当前未完成任务。
  const weekTasks = tasks.filter(t =>
    new Date(t.createdAt) >= weekAgo || new Date(t.updatedAt) >= weekAgo || t.status !== 'done'
  )

  // 本周任务数据（按分类汇总）。
  const byCategory = new Map<string, Task[]>()
  for (const t of weekTasks) {
    const arr = byCategory.get(t.category) ?? []
    arr.push(t)
    byCategory.set(t.category, arr)
  }
  const weeklyTasksSummary = byCategory.size
    ? [...byCategory.entries()]
        .map(([cat, list]) =>
          `【${cat}】（${list.length}个）\n${list.map(t => `- [${statusLabel(t.status)}] ${taskLine(t, false)}`).join('\n')}`
        )
        .join('\n')
    : '无'

  // 本周工作日志摘要（按天汇总关键词）。
  const weekEntries = journalEntries.filter(e => new Date(e.createdAt) >= weekAgo)
  const byDay = new Map<string, string[]>()
  for (const e of weekEntries) {
    const d = new Date(e.createdAt)
    const key = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const arr = byDay.get(key) ?? []
    arr.push(e.content)
    byDay.set(key, arr)
  }
  const weeklyJournalSummary = byDay.size
    ? [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, contents]) => {
          const joined = contents.join('；')
          const text = joined.length > 120 ? `${joined.slice(0, 120)}…` : joined
          return `- ${day}（${contents.length}条）：${text}`
        })
        .join('\n')
    : '本周暂无日志记录'

  const completedCount = weekTasks.filter(t => t.status === 'done').length
  const inProgressCount = weekTasks.filter(t => t.status === 'in_progress').length
  const pendingCount = weekTasks.filter(t => t.status === 'todo').length

  const prompt = `你是一个工作汇报助手。根据以下数据生成本周（${rangeLabel}）工作周报。

【本周任务数据（按分类汇总）】
${weeklyTasksSummary}

【本周工作日志摘要】
${weeklyJournalSummary}

【本周完成率数据】
完成：${completedCount}个，进行中：${inProgressCount}个，待办：${pendingCount}个

生成要求：
- 总长度不超过一页（400字以内）
- 本周完成要按模块/分类归类提炼，不是日报的简单拼接
- 每条用动词开头
- 问题与风险要分两层：已解决的问题 + 潜在风险（标注"⚠️风险"）
- 量化指标要体现（完成率、关键里程碑进度）
- 技术术语后加一句业务结论

请严格按以下格式输出：

## 本周完成（按模块归类）
**[模块名]**
- [动词] 具体事项及结果

## 下周计划
- [P0/P1/P2] [动词] 具体任务，预计完成时间

## 问题与风险
**已解决：**
- [问题] → [解法]

**⚠️ 潜在风险：**
- [风险描述] → [应对措施]

## 进度数据
- 本周任务完成率：X%（完成X个/共X个）
- 关键里程碑：[里程碑名] 完成 X%
- [其他量化指标]

## 学习沉淀（可选，有则写）
- 踩坑/方法总结`

  return callLLM(apiKey, prompt)
}
