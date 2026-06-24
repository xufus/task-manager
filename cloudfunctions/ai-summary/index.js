'use strict'

// AI 日报/周报云函数：在服务端持有 DeepSeek 密钥（环境变量 DEEPSEEK_API_KEY），
// 前端只传拼好的 prompt，密钥不下发到浏览器，所有登录用户共用。
// 用 Node 内置 https，零依赖，兼容各 Node 运行时。
const https = require('https')

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

exports.main = async (event) => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { error: '云函数未配置 DEEPSEEK_API_KEY 环境变量' }

  const prompt = event && event.prompt
  if (!prompt || typeof prompt !== 'string') return { error: '缺少 prompt 参数' }

  const n = Number(event && event.maxTokens)
  const maxTokens = n > 0 && n <= 4000 ? n : 1500

  try {
    const content = await callDeepSeek(apiKey, prompt, maxTokens)
    return { content }
  } catch (e) {
    return { error: (e && e.message) || 'AI 调用失败' }
  }
}
