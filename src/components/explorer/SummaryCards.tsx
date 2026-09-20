'use client'

import { Sparklines, SparklinesLine } from 'react-sparklines'
import type { PoolDto } from '@/lib/api/adapters'
import { Tooltip } from '@/components/ui/Tooltip'
import { TrendingUp, AlertTriangle } from 'lucide-react'

interface SummaryCardsProps {
  pools: PoolDto[]
}

export function SummaryCards({ pools }: SummaryCardsProps) {
  if (pools.length === 0) return null

  // Best risk-adjusted pick (highest realized_30d × risk_score/100)
  const ranked = [...pools].sort(
    (a, b) => b.realizedApy30d * (b.riskScore / 100) - a.realizedApy30d * (a.riskScore / 100)
  )
  const best = ranked[0]

  // Biggest gap
  const byGap = [...pools].sort(
    (a, b) => (b.headlineApy - b.realizedApy30d) - (a.headlineApy - a.realizedApy30d)
  )
  const biggestGap = byGap[0]

  // Average realized APY
  const avgRealized = pools.reduce((sum, p) => sum + p.realizedApy30d, 0) / pools.length

  const cards = [
    {
      label: 'Best Risk-Adjusted Pick',
      tooltip: 'Ranked by Realized APY × (Risk Score ÷ 100). Rewards both real yield and protocol safety.',
      value: best.name,
      subValue: `${best.realizedApy30d.toFixed(1)}% realized · Score ${best.riskScore}`,
      sparkline: best.sparkline30d,
      accent: 'var(--color-positive)',
      icon: <TrendingUp size={16} className="text-[var(--color-positive)]" />,
      badge: null,
    },
    {
      label: 'Biggest Headline–Realized Gap',
      tooltip: 'The largest gap between the advertised APY and what depositors actually received over 30 days.',
      value: biggestGap.name,
      subValue: `${biggestGap.headlineApy.toFixed(1)}% advertised vs ${biggestGap.realizedApy30d.toFixed(1)}% actual`,
      sparkline: biggestGap.sparkline30d,
      accent: 'var(--color-negative)',
      icon: <AlertTriangle size={16} className="text-[var(--color-negative)]" />,
      badge: `−${(biggestGap.headlineApy - biggestGap.realizedApy30d).toFixed(1)}% gap`,
    },
    {
      label: 'Avg Realized APY (30d)',
      tooltip: 'Simple average of the 30-day realized APY across all tracked protocols. Excludes token emissions.',
      value: `${avgRealized.toFixed(2)}%`,
      subValue: `Across ${pools.length} protocols`,
      sparkline: pools.map((p) => p.realizedApy30d),
      accent: 'var(--color-accent)',
      icon: <TrendingUp size={16} className="text-[var(--color-accent)]" />,
      badge: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card p-5 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {card.icon}
              <Tooltip content={card.tooltip}>
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                  {card.label}
                </span>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                {card.value}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{card.subValue}</p>
              {card.badge && (
                <span className="badge badge-red mt-2 text-[11px]">{card.badge}</span>
              )}
            </div>
            {/* Mini sparkline */}
            <div className="flex-shrink-0 opacity-80">
              <Sparklines data={card.sparkline} width={80} height={36} margin={2}>
                <SparklinesLine
                  color={card.accent}
                  style={{ strokeWidth: 1.5, fill: 'none' }}
                />
              </Sparklines>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
