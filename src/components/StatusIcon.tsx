import type { Status } from '../types'

export default function StatusIcon({ status, size = 14 }: { status: Status; size?: number }) {
  if (status === 'done') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="6" cy="6" r="6" fill="#00c853" />
        <path d="M3.2 6.2L5.1 8.1L8.8 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'in_progress') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="6" cy="6" r="4.5" stroke="#5e6ad2" strokeWidth="1.5" />
        <path d="M6 1.5 A4.5 4.5 0 0 1 6 10.5 Z" fill="#5e6ad2" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" strokeWidth="1.5" style={{ stroke: 'var(--text-muted)' }} />
    </svg>
  )
}
