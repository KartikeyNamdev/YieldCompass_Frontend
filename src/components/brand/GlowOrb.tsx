'use client'

import React from 'react'

export interface GlowOrbProps {
  color?: string
  size?: number | string
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
  opacity?: number
  className?: string
}

export function GlowOrb({
  color = 'var(--accent-glow)',
  size = 480,
  top,
  left,
  right,
  bottom,
  opacity = 0.6,
  className = '',
}: GlowOrbProps) {
  const sizePx = typeof size === 'number' ? `${size}px` : size

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full select-none ${className}`}
      style={{
        width: sizePx,
        height: sizePx,
        top,
        left,
        right,
        bottom,
        opacity,
        background: `radial-gradient(circle, ${color} 0%, rgba(34, 197, 94, 0.08) 45%, transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: 0,
      }}
    />
  )
}
