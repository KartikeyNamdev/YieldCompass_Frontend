'use client'

import React from 'react'
import { EyebrowPill } from './EyebrowPill'

export interface SectionHeadingProps {
  eyebrow?: string
  eyebrowIcon?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = 'center',
  className = '',
  titleClassName = '',
}: SectionHeadingProps) {
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  }[align]

  return (
    <div className={`flex flex-col max-w-3xl ${alignClass} ${className}`}>
      {eyebrow && (
        <div className="mb-3">
          <EyebrowPill icon={eyebrowIcon}>{eyebrow}</EyebrowPill>
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text)] leading-tight ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
