import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  title: string
  content: string
  time?: string
  onClose: () => void
}

// 复制用纯文本：去 **、去标题 # 前缀、- 列表转 •，保留换行，便于粘贴到钉钉/飞书/微信。
function toPlainText(content: string): string {
  return content
    .split('\n')
    .map(raw => {
      let line = raw.replace(/\*\*([^*]+)\*\*/g, '$1')
      line = line.replace(/^\s*#{1,6}\s+/, '')
      line = line.replace(/^(\s*)[-*]\s+/, '$1• ')
      return line
    })
    .join('\n')
}

export default function SummaryModal({ title, content, time, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(toPlainText(content))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6,
          maxWidth: 620, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(var(--on),0.06)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
            {time && (
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>生成时间：{time}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px', borderTop: '1px solid rgba(var(--on),0.06)' }}>
          <button
            onClick={copyAll}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: '1px solid rgba(94,106,210,0.3)', background: 'rgba(94,106,210,0.15)', color: '#7b8ce8',
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            {copied ? '已复制 ✓' : '复制全文'}
          </button>
        </div>
      </div>
    </div>
  )
}
