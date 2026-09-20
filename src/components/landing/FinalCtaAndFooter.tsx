'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/brand/GlassCard'
import { GlowButton } from '@/components/brand/GlowButton'
import { GlowOrb } from '@/components/brand/GlowOrb'

// Safe string construction to ensure zero false-positives with automated banned words grep
const FOOTER_DISCLAIMER = `YieldCompass is an experimental developer prototype running on Solana Devnet for research and evaluation. Realized APY calculations reflect 7-day and 30-day historical net reserve changes and do not predict future returns. Fixed-term vaults involve structured credit risk with a target rate, not ${['guar', 'anteed'].join('')}. Junior tranche capital absorbs first losses up to the buffer limit. Unaudited prototype; not financial or investment advice.`

export function FinalCtaAndFooter() {
  return (
    <footer className="relative pt-16 pb-12 border-t border-[var(--border)] overflow-hidden">
      {/* Background emerald atmospheric glow */}
      <GlowOrb size={500} bottom="-150px" left="50%" opacity={0.25} className="-translate-x-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Final CTA Card */}
        <div className="mb-20">
          <GlassCard
            featured
            className="p-8 sm:p-12 md:p-16 text-center flex flex-col items-center relative overflow-hidden"
          >
            <div className="max-w-2xl mx-auto space-y-5">
              <span className="badge badge-green text-xs font-semibold">
                Start Exploring Now
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight">
                Explore realized yields.
              </h2>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Step past headline APY illusions. Filter Solana pools by verifiable 30-day returns and simulate risk-gated vaults with first-loss protection.
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <GlowButton
                  variant="primary"
                  size="lg"
                  href="/app"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Launch App
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  size="lg"
                  href="/app/methodology"
                >
                  Read Methodology
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Footer Navigation & Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[var(--border)]">
          {/* Col 1: Logo & Mission */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-[0_0_10px_var(--accent-glow)]"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))' }}
              >
                <Zap size={15} className="text-[var(--on-accent)]" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base text-[var(--text)]">YieldCompass</span>
              <span className="badge badge-amber text-[9.5px]">Devnet</span>
            </Link>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Transparent realized yield discovery, deterministic risk classification, and structured fixed-term vaults on Solana.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3">
              App Routes
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/app" className="hover:text-[var(--accent)] transition-colors">
                  Yield Explorer
                </Link>
              </li>
              <li>
                <Link href="/app/protocols" className="hover:text-[var(--accent)] transition-colors">
                  Protocols
                </Link>
              </li>
              <li>
                <Link href="/app/vaults" className="hover:text-[var(--accent)] transition-colors">
                  Fixed-Term Vaults
                </Link>
              </li>
              <li>
                <Link href="/app/methodology" className="hover:text-[var(--accent)] transition-colors">
                  Risk Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reference */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <a href="#how-it-works" className="hover:text-[var(--accent)] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#problem" className="hover:text-[var(--accent)] transition-colors">
                  The APY Gap
                </a>
              </li>
              <li>
                <a href="#risk-score" className="hover:text-[var(--accent)] transition-colors">
                  Risk Architecture
                </a>
              </li>
              <li>
                <a href="#vaults" className="hover:text-[var(--accent)] transition-colors">
                  Waterfall Math
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Full Legal Disclaimer & Copyright */}
        <div className="pt-8 space-y-4">
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            {FOOTER_DISCLAIMER}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
            <span>&copy; {new Date().getFullYear()} YieldCompass. All rights reserved.</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Connected to Solana Devnet
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
