'use client'

import React from 'react'
import { AlertCircle, FileWarning, Terminal, Landmark, ShieldX } from 'lucide-react'
import { SectionHeading } from '@/components/brand/SectionHeading'
import { GlassCard } from '@/components/brand/GlassCard'

const HONEST_ITEMS = [
  {
    title: 'Devnet Only',
    badge: 'Environment',
    icon: <Terminal size={18} className="text-[var(--warning)]" />,
    text: 'Operating strictly on Solana Devnet. All deposits, tranches, and yields use simulated testnet tokens. No real capital is ever handled.',
  },
  {
    title: 'Mock Yield Source',
    badge: 'Telemetry',
    icon: <Landmark size={18} className="text-[var(--warning)]" />,
    text: 'Telemetry feeds and historical pool performance reflect seeded mock data for prototype evaluation and verification.',
  },
  {
    title: 'Unaudited Prototype',
    badge: 'Security',
    icon: <FileWarning size={18} className="text-[var(--negative)]" />,
    text: 'Smart contract programs and risk scoring algorithms are early prototypes and have not undergone third-party commercial security audits.',
  },
  {
    title: 'No Secondary Market',
    badge: 'Liquidity',
    icon: <ShieldX size={18} className="text-[var(--text-muted)]" />,
    text: 'Tranche positions are non-transferable fixed-duration commitments with no DEX listing or secondary trading liquidity.',
  },
  {
    title: 'Informational Only',
    badge: 'Disclaimer',
    icon: <AlertCircle size={18} className="text-[var(--accent)]" />,
    text: 'Risk scores, factor weights, and realized comparisons represent mathematical models and do not constitute financial advice.',
  },
]

export function HonestCardsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          eyebrow="Radical Transparency"
          title="What this is, and what it is not."
          subtitle="We believe in total honesty about prototype capabilities, network environments, and operational boundaries."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {HONEST_ITEMS.map((item, idx) => (
            <GlassCard
              key={item.title}
              className={`p-6 flex flex-col justify-between ${idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-strong)] border border-[var(--border)] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="badge badge-gray text-[10px]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.text}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
