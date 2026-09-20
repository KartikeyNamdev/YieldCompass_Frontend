import { DISCLAIMER } from '@/lib/vault/disclaimer'

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--text-muted)] ${className}`} role="note">
      {DISCLAIMER}
    </p>
  )
}
