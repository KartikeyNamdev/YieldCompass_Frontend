'use client'
import type { SeriesStatus } from '@/lib/api/adapters'
import { useNow } from '@/lib/hooks/useNow'

const STYLE: Record<SeriesStatus, { cls: string; label: string }> = {
  open: { cls: 'badge-indigo', label: 'Open for deposits' },
  active: { cls: 'badge-green', label: 'Active' },
  settled: { cls: 'badge-gray', label: 'Settled' },
  cancelled: { cls: 'badge-red', label: 'Cancelled' },
}

/** An open series whose deposit window has closed is waiting for someone to activate (or cancel) it. */
export function StatusBadge({ status, depositDeadline }: { status: SeriesStatus; depositDeadline?: string }) {
  const now = useNow(1000)
  const waiting = status === 'open' && depositDeadline !== undefined && now >= new Date(depositDeadline).getTime()
  const s = waiting ? { cls: 'badge-amber', label: 'Awaiting activation' } : STYLE[status]
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}
