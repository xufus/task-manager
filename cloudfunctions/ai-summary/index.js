'use strict'

// AI 日报/周报云函数：
// 1) 服务端持有 DeepSeek 密钥（环境变量 DEEPSEEK_API_KEY），前端不接触密钥；
// 2) 按「登录用户 + 自然日」限次，防止滥用（上限 env AI_DAILY_LIMIT，默认 3 次/天）。
// 用 Node 内置 https 调 DeepSeek（零三方依赖），用 @cloudbase/node-sdk 取登录态 + 计数。
const https = require('https')
const cloud = require('@cloudbase/node-sdk')

const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
const db = app.database()

const USAGE_COLLECTION = 'ai_usage'

function dailyLimit() {
  const n = Number(process.env.AI_DAILY_LIMIT)
  return n > 0 ? n : 3
}

// 以北京时间（UTC+8）的自然日作为限次窗口，每天 0 点重置。
function beijingDay() {
  const t = new Date(Date.now() + 8 * 3600 * 1000)
  return t.toISOString().slice(0, 10) // YYYY-MM-DD
}

// 解析调用者的稳定用户标识；取不到视为未登录。
async function resolveUid(context) {
  try {
    const auth = app.auth()
    if (auth && typeof auth.getEndUserInfo === 'function') {
      const r = (await auth.getEndUserInfo(context)) || {}
      const u = r.userInfo || r
      const id = u && (u.uid || u.userId || u.customUserId || u.openId)
      if (id) return String(id)
    }
  } catch (e) {
    /* 退回原始上下文 */
  }
  try {
    const ctx = cloud.getCloudbaseContext(context) || {}
    const id = ctx.TCB_CUSTOM_USER_ID || ctx.TCB_UUID || ctx.OPENID || ctx.CONSUMER_ID
    if (id) return String(id)
  } catch (e) {
    /* ignore */
  }
  return ''
}

async function readCount(docId) {
  try {
    const r = await db.collection(USAGE_COLLECTION).doc(docId).get()
    const doc = r && r.data && (Array.isArray(r.data) ? r.data[0] : r.data)
    return (doc && doc.count) || 0
  } catch (e) {
    // 集合不存在则首次创建，计数按 0 处理。
    try { await db.createCollection(USAGE_COLLECTION) } catch (_e) { /* 已存在 */ }
    return 0
  }
}

// 直接写入绝对计数（doc.set 创建或覆盖）。并发下可能少计极少数，足够防滥用。
async function writeCount(docId, uid, day, count) {
  const data = { uid: uid, day: day, count: count, updatedAt: Date.now() }
  try {
    await db.collection(USAGE_COLLECTION).doc(docId).set(data)
  } catch (e) {
    try { await db.createCollection(USAGE_COLLECTION) } catch (_e) { /* 已存在 */ }
    try { await db.collection(USAGE_COLLECTION).doc(docId).set(data) } catch (_e2) { /* best-effort */ }
  }
}

function callDeepSeek(apiKey, prompt, maxTokens) {
  const payload = JSON.stringify({
    model: 'deepseek-chat',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: 'api.deepseek.com',
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = ''
        res.on('data', (c) => (body += c))
        res.on('end', () => {
          let data
          try {
            data = JSON.parse(body)
          } catch (e) {
            return reject(new Error('解析 DeepSeek 响应失败'))
          }
          if (res.statusCode >= 400) {
            return reject(new Error((data.error && data.error.message) || ('HTTP ' + res.statusCode)))
          }
          const content =
            data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
          resolve(content || '')
        })
      },
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

exports.main = async (event, context) => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { error: '云函数未配置 DEEPSEEK_API_KEY 环境变量' }

  const prompt = event && event.prompt
  if (!prompt || typeof prompt !== 'string') return { error: '缺少 prompt 参数' }

  const n = Number(event && event.maxTokens)
  const maxTokens = n > 0 && n <= 4000 ? n : 1500

  // 限次：必须登录 + 当天未超额。
  const uid = await resolveUid(context)
  if (!uid) return { error: '请先登录后再使用 AI 功能' }

  const limit = dailyLimit()
  const day = beijingDay()
  const docId = uid + '_' + day

  const used = await readCount(docId)
  if (used >= limit) {
    return { error: '今日 AI 生成已达上限（' + limit + ' 次/天），请明天再试' }
  }

  let content
  try {
    content = await callDeepSeek(apiKey, prompt, maxTokens)
  } catch (e) {
    return { error: (e && e.message) || 'AI 调用失败' }
  }

  // 仅在成功生成后才计数（失败不扣次数）。
  await writeCount(docId, uid, day, used + 1)
  return { content: content, used: used + 1, limit: limit }
}
