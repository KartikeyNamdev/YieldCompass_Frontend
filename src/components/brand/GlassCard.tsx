'use client'

import React from 'react'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  featured?: boolean
  hoverLift?: boolean
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  topHighlight?: boolean
}

export function GlassCard({
  children,
  className = '',
  featured = false,
  hoverLift = true,
  radius = 'xl',
  topHighlight = true,
  style,
  ...props
}: GlassCardProps) {
  const radiusClass = {
    sm: 'rounded-[14px]',
    md: 'rounded-[18px]',
    lg: 'rounded-[20px]',
    xl: 'rounded-[24px]',
    '2xl': 'rounded-[28px]',
  }[radius]

  return (
    <div
      className={`
        relative overflow-hidden
        border
        ${featured ? 'bg-gradient-to-b from-[rgba(34,197,94,0.07)] via-[var(--surface-strong)] to-[var(--bg-elevated)] border-[rgba(52,211,153,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(34,197,94,0.1)]' : 'bg-[var(--surface)] border-[var(--border)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]'}
        ${radiusClass}
        ${hoverLift ? 'transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.55)]' : ''}
        ${topHighlight ? 'card-top-highlight' : ''}
        ${className}
      `}
      style={style}
      {...props}
    >
      {/* Featured radial glow in top right */}
      {featured && (
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(34, 197, 94, 0.05) 50%, transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
  )
}
