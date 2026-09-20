'use client'

import React from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { SectionHeading } from '@/components/brand/SectionHeading'
import { GlassCard } from '@/components/brand/GlassCard'

interface GapProtocolData {
  id: string
  name: string
  category: string
  initial: string
  color: string
  headlineApy: number
  realizedApy: number
  emissionsShare: number
  description: string
}

const GAP_PROTOCOLS: GapProtocolData[] = [
  {
    id: 'save',
    name: 'Save (Solend)',
    category: 'Lending',
    initial: 'S',
    color: '#5B5BD6',
    headlineApy: 14.7,
    realizedApy: 3.9,
    emissionsShare: 72,
    description: 'Headline rate is boosted by SLND reward token distributions that experienced heavy price volatility.',
  },
  {
    id: 'jupiter-lend',
    name: 'Jupiter Lend',
    category: 'Lending',
    initial: 'J',
    color: '#16A34A',
    headlineApy: 11.4,
    realizedApy: 4.9,
    emissionsShare: 55,
    description: 'Over half of the advertised yield relies on promotional incentive pools rather than organic borrower interest.',
  },
  {
    id: 'kamino',
    name: 'Kamino Finance',
    category: 'Lending',
    initial: 'K',
    color: '#7C3AED',
    headlineApy: 9.2,
    realizedApy: 5.8,
    emissionsShare: 34,
    description: 'Majority organic borrower fee volume (66%) with a moderate KMNO reward emission component.',
  },
]

export function TheGapSection() {
  const maxApy = 16.0 // Reference maximum for relative bar width calculation

  return (
    <section id="problem" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          eyebrow="The Gap"
          title="Headline APY often includes bonus tokens."
          subtitle="Protocols market peak headline APYs inflated by speculative governance tokens. YieldCompass tracks what pools actually earned in real USDC value."
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAP_PROTOCOLS.map((item) => {
            const gap = item.headlineApy - item.realizedApy
            const headlineWidth = `${(item.headlineApy / maxApy) * 100}%`
            const realizedWidth = `${(item.realizedApy / maxApy) * 100}%`
            const isMostlyBonus = item.emissionsShare > 50

            return (
              <GlassCard
                key={item.id}
                featured={isMostlyBonus}
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Icon, Name, and optional warning badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.initial}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)] leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {isMostlyBonus && (
                      <span className="badge badge-red text-[10px] whitespace-nowrap">
                        <AlertTriangle size={11} />
                        Mostly bonus tokens
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Comparison Bars */}
                  <div className="space-y-4 mb-6">
                    {/* Headline Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-muted)] font-medium">Advertised Headline</span>
                        <span className="font-bold text-[#FBBF24] tabular">{item.headlineApy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[var(--surface-strong)] overflow-hidden border border-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400 transition-all duration-700 ease-out"
                          style={{ width: headlineWidth }}
                        />
                      </div>
                    </div>

                    {/* Realized Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-muted)] font-medium">Actual Realized (30d)</span>
                        <span className="font-bold text-[var(--accent)] tabular">{item.realizedApy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[var(--surface-strong)] overflow-hidden border border-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)] transition-all duration-700 ease-out"
                          style={{ width: realizedWidth }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Breakdown */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--negative)] font-medium">
                    <TrendingDown size={14} />
                    <span>-{gap.toFixed(1)}% Gap</span>
                  </div>
                  <div className="text-[var(--text-secondary)] font-medium text-[11px]">
                    <span className="tabular">{item.emissionsShare}%</span> emissions share
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
