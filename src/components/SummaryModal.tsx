interface Props {
  title: string
  content: string
  onClose: () => void
}

export default function SummaryModal({ title, content, onClose }: Props) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
          maxWidth: 600, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e2e8' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a8a9a', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#e2e2e8', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content}</p>
        </div>
      </div>
    </div>
  )
}
