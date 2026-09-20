'use client'

import React from 'react'
import Link from 'next/link'

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  href?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function GlowButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-[13.5px] rounded-xl gap-2 font-semibold',
    lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2.5 font-semibold tracking-wide',
  }[size]

  const variantClasses = {
    primary:
      'bg-[var(--accent)] text-[var(--on-accent)] border border-[rgba(52,211,153,0.4)] shadow-[0_0_20px_var(--accent-glow)] hover:bg-[var(--accent-strong)] hover:shadow-[0_0_28px_rgba(34,197,94,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_0_12px_var(--accent-glow)]',
    ghost:
      'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-strong)] hover:text-[var(--accent)] hover:border-[var(--border-strong)] hover:shadow-[0_0_16px_rgba(52,211,153,0.15)] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-[var(--surface-strong)] text-[var(--text)] border border-[var(--border)] hover:border-[rgba(52,211,153,0.3)] hover:text-[var(--accent)] hover:-translate-y-0.5 active:translate-y-0',
  }[variant]

  const baseClasses = `
    inline-flex items-center justify-center
    cursor-pointer
    transition-all duration-200 ease-out
    select-none
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    ${sizeClasses}
    ${variantClasses}
    ${className}
  `

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button disabled={disabled} className={baseClasses} {...props}>
      {content}
    </button>
  )
}
