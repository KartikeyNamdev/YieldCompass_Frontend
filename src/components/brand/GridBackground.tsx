'use client'

import React from 'react'

export interface GridBackgroundProps {
  children?: React.ReactNode
  className?: string
  faint?: boolean
  withRadialFade?: boolean
}

export function GridBackground({
  children,
  className = '',
  faint = true,
  withRadialFade = true,
}: GridBackgroundProps) {
  const strokeOpacity = faint ? '0.04' : '0.07'

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background SVG Grid Pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={
          withRadialFade
            ? {
                maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
              }
            : undefined
        }
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="brand-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeOpacity={strokeOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brand-grid-pattern)" />
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
