'use client'

import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string
  children?: React.ReactNode
  showIcon?: boolean
}

export function Tooltip({ content, children, showIcon = true }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false)
    }
    if (visible) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible])

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      {showIcon && (
        <span
          ref={ref}
          role="button"
          tabIndex={0}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-smooth cursor-help focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          aria-label={`Learn more: ${content}`}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          onFocus={() => setVisible(true)}
          onBlur={() => setVisible(false)}
        >
          <Info size={11} />
        </span>
      )}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 rounded-xl bg-[var(--color-text-primary)] text-white text-xs leading-relaxed px-3 py-2 shadow-lg animate-fade-in"
        >
          {content}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-text-primary)]"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  )
}
