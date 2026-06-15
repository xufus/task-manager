import type { Priority } from '../types'
import { PRIORITY_META } from '../constants'

// 统一的优先级胶囊：「P0: 重要紧急」。传入 onRemove 时尾部显示可点击的「×」。
export default function PriorityTag({ priority, onRemove, style }: {
  priority: Priority
  onRemove?: () => void
  style?: React.CSSProperties
}) {
  const m = PRIORITY_META[priority]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
      lineHeight: 1.4, whiteSpace: 'nowrap',
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
      ...style,
    }}>
      {m.short}: {m.label}
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove() }}
          aria-label="移除"
          style={{
            background: 'none', border: 'none', color: m.color, cursor: 'pointer',
            padding: 0, marginLeft: 1, fontSize: 13, lineHeight: 1, display: 'flex',
            opacity: 0.8,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
        >×</button>
      )}
    </span>
  )
}
