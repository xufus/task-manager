import { useState, useEffect } from 'react'
import { login, sendEmailCode, registerWithCode, type AuthUser } from '../cloudbase'

interface Props {
  onAuthed: (user: AuthUser) => void
}

type Mode = 'login' | 'register'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage({ onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  // 重发验证码倒计时
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setHint(null)
    setConfirm('')
    setCode('')
    setVerificationId('')
    setCooldown(0)
  }

  async function handleSendCode() {
    setError(null)
    setHint(null)
    const acc = account.trim()
    if (!EMAIL_RE.test(acc)) { setError('请输入有效的邮箱地址'); return }
    setSendingCode(true)
    try {
      const { verificationId: vid, isUser } = await sendEmailCode(acc)
      setVerificationId(vid)
      setCooldown(60)
      setHint(isUser ? '该邮箱已注册，可直接切换到「登录」' : '验证码已发送，请查收邮箱')
    } catch (err) {
      setError((err as Error).message || '验证码发送失败')
    } finally {
      setSendingCode(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const acc = account.trim()

    if (mode === 'register') {
      if (!EMAIL_RE.test(acc)) { setError('请输入有效的邮箱地址'); return }
      if (!verificationId) { setError('请先获取邮箱验证码'); return }
      if (!code.trim()) { setError('请输入验证码'); return }
      if (password.length < 8) { setError('密码至少 8 位'); return }
      if (password !== confirm) { setError('两次输入的密码不一致'); return }
    } else {
      if (!acc || !password) { setError('请输入账号和密码'); return }
    }

    setBusy(true)
    try {
      const user = mode === 'register'
        ? await registerWithCode(acc, password, verificationId, code.trim())
        : await login(acc, password)
      onAuthed(user)
    } catch (err) {
      setError((err as Error).message || (mode === 'register' ? '注册失败' : '登录失败'))
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
  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: 'pointer', border: 'none', transition: 'all 0.1s',
    background: active ? 'rgba(94,106,210,0.15)' : 'transparent',
    color: active ? '#5e6ad2' : 'var(--text-muted)',
  })

  const isRegister = mode === 'register'
  const codeBtnDisabled = sendingCode || cooldown > 0
  const codeBtnLabel = sendingCode ? '发送中' : cooldown > 0 ? `${cooldown}s` : '发送验证码'

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
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
          {isRegister ? '创建账号开始使用' : '登录以同步你的任务'}
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          <button type="button" onClick={() => switchMode('login')} style={tab(!isRegister)}>登录</button>
          <button type="button" onClick={() => switchMode('register')} style={tab(isRegister)}>注册</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>{isRegister ? '邮箱' : '邮箱 / 用户名'}</label>
          {isRegister ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="email"
                value={account}
                onChange={e => setAccount(e.target.value)}
                autoComplete="email"
                autoFocus
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeBtnDisabled}
                style={{
                  padding: '0 12px', borderRadius: 6, fontSize: 12, whiteSpace: 'nowrap',
                  background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.3)',
                  color: '#5e6ad2', cursor: codeBtnDisabled ? 'default' : 'pointer',
                  opacity: codeBtnDisabled ? 0.6 : 1,
                }}
              >{codeBtnLabel}</button>
            </div>
          ) : (
            <input
              type="text"
              value={account}
              onChange={e => setAccount(e.target.value)}
              autoComplete="username"
              autoFocus
              style={inputStyle}
            />
          )}
        </div>

        {isRegister && (
          <div style={{ marginBottom: 14 }}>
            <label style={label}>邮箱验证码</label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => setCode(e.target.value)}
              autoComplete="one-time-code"
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: isRegister ? 14 : 8 }}>
          <label style={label}>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            style={inputStyle}
          />
          {isRegister && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>至少 8 位，建议含字母和数字</p>
          )}
        </div>

        {isRegister && (
          <div style={{ marginBottom: 8 }}>
            <label style={label}>确认密码</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>
        )}

        {hint && !error && (
          <div style={{ fontSize: 12, color: '#3fb950', margin: '10px 0 0' }}>{hint}</div>
        )}
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
        >{busy ? '请稍候…' : isRegister ? '注册' : '登录'}</button>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          {isRegister ? '已有账号？' : '还没有账号？'}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            style={{ background: 'none', border: 'none', color: '#5e6ad2', cursor: 'pointer', fontSize: 12, padding: '0 0 0 4px' }}
          >{isRegister ? '去登录' : '立即注册'}</button>
        </div>
      </form>
    </div>
  )
}
