interface Props {
  onClose: () => void
  username?: string
  onLogout?: () => void
}

export default function SettingsPanel({ onClose, username, onLogout }: Props) {
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
            <label style={label}>AI 日报/周报</label>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              已接入云端 AI 服务，无需配置密钥，直接在顶部点「生成日报 / 周报」即可。
            </p>
          </div>

          {onLogout && (
            <div>
              <label style={label}>账户</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {username || '已登录'}
                </span>
                <button
                  onClick={onLogout}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444',
                  }}
                >退出登录</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13,
              background: 'rgba(var(--on),0.05)', border: '1px solid rgba(var(--on),0.08)',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >关闭</button>
        </div>
      </div>
    </div>
  )
}
