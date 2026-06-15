import { useState } from 'react'
import { login, type AuthUser } from '../cloudbase'

interface Props {
  onAuthed: (user: AuthUser) => void
}

export default function LoginPage({ onAuthed }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const u = username.trim()
    if (!u || !password) { setError('请输入用户名和密码'); return }
    setBusy(true)
    try {
      const user = await login(u, password)
      onAuthed(user)
    } catch (err) {
      setError((err as Error).message || '登录失败')
    } finally {
      setBusy(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 14,
    background: 'rgba(var(--on),0.04)', border: '1px solid rgba(var(--on),0.12)',
    color: 'var(--text)', boxSizing: 'border-box', outline: 'none',
  }
  const label: React.CSSProperties = {
    fontSize: 10, fontWeight: 500, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text)',
    }}>
      <form
        onSubmit={submit}
        style={{
          width: 340, background: 'var(--bg-card)', border: '1px solid rgba(var(--on),0.1)',
          borderRadius: 10, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>任务管理</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>登录以同步你的任务</div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>用户名</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={label}>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#ff4444', margin: '10px 0 0' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%', marginTop: 18, padding: '9px 0', borderRadius: 6, fontSize: 14, fontWeight: 500,
            background: '#5e6ad2', color: '#fff', border: 'none',
            cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, transition: 'filter 0.1s',
          }}
          onMouseEnter={e => { if (!busy) e.currentTarget.style.filter = 'brightness(1.15)' }}
          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
        >{busy ? '请稍候…' : '登录'}</button>

        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.6 }}>
          账号在 CloudBase 控制台「身份验证 → 用户管理」中创建
        </div>
      </form>
    </div>
  )
}
