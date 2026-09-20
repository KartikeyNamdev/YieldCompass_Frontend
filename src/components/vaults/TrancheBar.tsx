import { formatUsdc } from '@/lib/vault/format'

export function TrancheBar({ label, deposited, capacity }: { label: string; deposited: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, (deposited / capacity) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="tabular-nums">
          {formatUsdc(deposited)} / {formatUsdc(capacity)}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
