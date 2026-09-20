'use client'

import React from 'react'

interface TrackedProtocol {
  name: string
  initial: string
  color: string
  category: string
}

const TRACKED_PROTOCOLS: TrackedProtocol[] = [
  { name: 'Kamino Finance', initial: 'K', color: '#7C3AED', category: 'Lending' },
  { name: 'MarginFi', initial: 'M', color: '#0891B2', category: 'Lending' },
  { name: 'Jupiter Lend', initial: 'J', color: '#16A34A', category: 'Lending' },
  { name: 'Jito', initial: 'JT', color: '#D97706', category: 'Liquid Staking' },
  { name: 'Marinade Finance', initial: 'MN', color: '#EA580C', category: 'Liquid Staking' },
  { name: 'Save (Solend)', initial: 'S', color: '#5B5BD6', category: 'Lending' },
]

export function MarqueeTrack() {
  // Triple items for continuous marquee loop
  const loopItems = [...TRACKED_PROTOCOLS, ...TRACKED_PROTOCOLS, ...TRACKED_PROTOCOLS]

  return (
    <section className="py-12 border-y border-[var(--border)] bg-[var(--bg-elevated)]/40 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Yield sources we track
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="flex w-max animate-[ticker_35s_linear_infinite] hover:[animation-play-state:paused] gap-6 px-4">
          {loopItems.map((proto, idx) => (
            <div
              key={`${proto.name}-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:border-[var(--border-strong)] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: proto.color }}
              >
                {proto.initial}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)] whitespace-nowrap">
                  {proto.name}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {proto.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
