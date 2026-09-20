'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

// Seed ticker data (in real mode, would come from API)
const TICKER_ITEMS = [
  { protocol: 'Kamino', headline: 9.2, realized: 6.1 },
  { protocol: 'MarginFi', headline: 7.8, realized: 6.9 },
  { protocol: 'Jupiter Lend', headline: 11.4, realized: 4.9 },
  { protocol: 'Jito', headline: 8.1, realized: 7.6 },
  { protocol: 'Marinade', headline: 7.3, realized: 7.0 },
  { protocol: 'Save', headline: 14.7, realized: 3.9 },
]

export function TickerStrip() {
  // Duplicate items so the ticker loops seamlessly
  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/60 backdrop-blur-sm overflow-hidden"
      role="marquee"
      aria-label="Live protocol yield ticker"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
      }}
    >
      <div className="relative flex items-center h-8">
        <div className="ticker-content hover:pause">
          {allItems.map((item, i) => {
            const gap = item.headline - item.realized
            const isPositive = gap <= 1.5
            return (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-6 py-1.5 text-xs border-r border-[var(--border)]"
              >
                <span className="font-semibold text-[var(--text)]">
                  {item.protocol}
                </span>
                <span className="text-[var(--text-secondary)]">
                  Headline{' '}
                  <span className="font-semibold tabular">{item.headline.toFixed(1)}%</span>
                </span>
                <span className="text-[var(--border)]">|</span>
                <span className="text-[var(--text-secondary)]">
                  Realized{' '}
                  <span
                    className={`font-semibold tabular ${isPositive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
                  >
                    {item.realized.toFixed(1)}%
                  </span>
                </span>
                {isPositive ? (
                  <TrendingUp
                    size={11}
                    className="text-[var(--positive)]"
                    aria-label="Yield matches headline"
                  />
                ) : (
                  <TrendingDown
                    size={11}
                    className="text-[var(--negative)]"
                    aria-label="Below headline"
                  />
                )}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
