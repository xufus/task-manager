import { useState } from 'react'
import type { AppSettings } from '../types'
import { categoryStyle } from '../constants'

interface Props {
  settings: AppSettings
  onUpdate: (updates: Partial<AppSettings>) => void
  categories: string[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (name: string) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onUpdate, categories, onAddCategory, onDeleteCategory, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [showKey, setShowKey] = useState(false)
  const [newCat, setNewCat] = useState('')

  function addCat() {
    const n = newCat.trim()
    if (!n) return
    onAddCategory(n)
    setNewCat('')
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 13,
    background: 'rgba(var(--on),0.04)',
    border: '1px solid rgba(var(--on),0.1)',
    color: 'var(--text)', boxSizing: 'border-box',
  }
  const label: React.CSSProperties = {
    fontSize: 10, fontWeight: 500, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 6,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)', borderRadius: 6,
          padding: 20, width: 380,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>设置</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={label}>Claude API Key</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                style={inputStyle}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  background: 'rgba(var(--on),0.05)', border: '1px solid rgba(var(--on),0.1)',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap',
                }}
              >{showKey ? '隐藏' : '显示'}</button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>用于 AI 日报和周报功能，仅保存在本地浏览器</p>
          </div>

          <div>
            <label style={label}>分类管理</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="新分类名称"
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCat() } }}
              />
              <button
                onClick={addCat}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: 'rgba(94,106,210,0.15)', border: '1px solid rgba(94,106,210,0.3)', color: '#7b8ce8',
                }}
              >添加</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map(c => {
                const cs = categoryStyle(c)
                return (
                  <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: cs.text, background: cs.bg, padding: '3px 7px 3px 9px', borderRadius: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cs.dot }} />
                    {c}
                    {categories.length > 1 && (
                      <button
                        onClick={() => onDeleteCategory(c)}
                        title="删除分类"
                        style={{ background: 'none', border: 'none', color: cs.text, cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.55 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
                      >✕</button>
                    )}
                  </span>
                )
              })}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>删除分类不会影响已使用该分类的任务（至少保留一个）</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => { onUpdate({ apiKey }); onClose() }}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: '#5e6ad2', color: '#fff', border: 'none', cursor: 'pointer',
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >保存</button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13,
              background: 'rgba(var(--on),0.05)', border: '1px solid rgba(var(--on),0.08)',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >取消</button>
        </div>
      </div>
    </div>
  )
}
