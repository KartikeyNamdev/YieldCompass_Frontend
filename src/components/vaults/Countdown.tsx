'use client'
import { useNow } from '@/lib/hooks/useNow'
import { formatCountdown } from '@/lib/vault/format'

export function Countdown({ to, doneLabel = 'now' }: { to: string; doneLabel?: string }) {
  const now = useNow(1000)
  const ms = new Date(to).getTime() - now
  return <span className="tabular-nums">{ms <= 0 ? doneLabel : formatCountdown(ms)}</span>
}
