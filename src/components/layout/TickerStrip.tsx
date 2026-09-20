'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { useProtocols } from '@/lib/hooks/useProtocols'

export function TickerStrip() {
  // Same data source as the explorer, so the ticker never disagrees with the table
  const { data: pools = [] } = useProtocols('aggressive')
  const items = pools.map((p) => ({ protocol: p.name.replace(/ \(sample\)$/, ''), headline: p.headlineApy, realized: p.realizedApy30d }))
  if (items.length === 0) return null
  // Duplicate items so the ticker loops seamlessly
  const allItems = [...items, ...items]

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
