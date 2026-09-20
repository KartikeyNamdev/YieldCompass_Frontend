'use client'

import React from 'react'

export interface EyebrowPillProps {
  children: React.ReactNode
  icon?: React.ReactNode
  variant?: 'emerald' | 'warning' | 'negative' | 'neutral'
  className?: string
  pulseDot?: boolean
}

export function EyebrowPill({
  children,
  icon,
  variant = 'emerald',
  className = '',
  pulseDot = true,
}: EyebrowPillProps) {
  const variantStyles = {
    emerald: {
      container: 'bg-[var(--accent-soft)] border-[rgba(52,211,153,0.3)] text-[var(--accent)] shadow-[0_0_12px_rgba(52,211,153,0.15)]',
      dot: 'bg-[var(--accent)]',
    },
    warning: {
      container: 'bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)] text-[var(--warning)]',
      dot: 'bg-[var(--warning)]',
    },
    negative: {
      container: 'bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.3)] text-[var(--negative)]',
      dot: 'bg-[var(--negative)]',
    },
    neutral: {
      container: 'bg-[rgba(255,255,255,0.04)] border-[var(--border)] text-[var(--text-secondary)]',
      dot: 'bg-[var(--text-muted)]',
    },
  }[variant]

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium tracking-wide
        ${variantStyles.container}
        ${className}
      `}
    >
      {pulseDot && !icon && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variantStyles.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${variantStyles.dot}`} />
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="font-semibold uppercase tracking-wider text-[10.5px]">{children}</span>
    </div>
  )
}
