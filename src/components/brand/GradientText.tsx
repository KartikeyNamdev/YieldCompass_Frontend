'use client'

import React from 'react'

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'emerald' | 'silver' | 'amber'
  className?: string
}

export function GradientText({
  children,
  variant = 'emerald',
  className = '',
  ...props
}: GradientTextProps) {
  const gradientStyles = {
    emerald: 'from-[#FFFFFF] via-[#6EE7B7] to-[#34D399]',
    silver: 'from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8]',
    amber: 'from-[#FFFFFF] via-[#FDE68A] to-[#F59E0B]',
  }[variant]

  return (
    <span
      className={`bg-gradient-to-r ${gradientStyles} bg-clip-text text-transparent inline-block ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
