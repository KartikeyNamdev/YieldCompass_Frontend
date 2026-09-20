'use client'

import React from 'react'
import { Info, CheckCircle2 } from 'lucide-react'
import { SectionHeading } from '@/components/brand/SectionHeading'
import { GlassCard } from '@/components/brand/GlassCard'
import { RiskRing } from '@/components/ui/RiskRing'

interface FactorData {
  label: string
  weight: number
  earned: number
  notes: string
}

// 7-factor weights matching the prompt specification and Jito seed data (score 88)
const RISK_FACTORS: FactorData[] = [
  { label: 'Smart-contract & audit quality', weight: 25, earned: 23, notes: 'Multiple audits by Neodyme, OtterSec. Zero unresolved issues.' },
  { label: 'TVL size & stability', weight: 20, earned: 19, notes: '$2.1B TVL with low 30-day volatility (<15%).' },
  { label: 'Yield source quality', weight: 20, earned: 18, notes: 'Real MEV-boosted validator rewards; 92% organic economic yield.' },
  { label: 'Maturity & incident history', weight: 10, earned: 9, notes: 'Clean 2-year operational history without security incidents.' },
  { label: 'Oracle & dependency risk', weight: 10, earned: 9, notes: 'Direct on-chain validator cashflow; zero external DEX oracle dependency.' },
  { label: 'Withdrawal liquidity', weight: 10, earned: 8, notes: 'Deep DEX liquidity and native un-stake capacity.' },
  { label: 'Governance & admin-key risk', weight: 5, earned: 4, notes: 'Timelock-controlled upgrades with active multisig governance.' },
]

export function RiskScoreSection() {
  return (
    <section id="risk-score" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          eyebrow="Risk Architecture"
          title="Deterministic scoring. Zero black-box AI."
          subtitle="Every score is computed by transparent rules across 7 security dimensions. Artificial intelligence is restricted to extracting cited facts and summarizing audit certificates."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Left Column: Big Ring + Summary Card (5 cols) */}
          <div className="lg:col-span-5">
            <GlassCard featured className="p-8 text-center flex flex-col items-center">
              <div className="mb-4">
                <span className="badge badge-green text-xs font-semibold">
                  Sample Protocol: Jito (JitoSOL)
                </span>
              </div>

              {/* Big Risk Ring */}
              <div className="my-3">
                <RiskRing score={88} size={140} strokeWidth={10} showLabel />
              </div>

              <h3 className="text-lg font-bold text-[var(--text)] mt-4">
                Institutional Safety Grade
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs leading-relaxed">
                Eligible for Fixed-Term Tranche Series 01 deployment (&ge;75 gate threshold).
              </p>

              {/* Explicit Mandatory Note */}
              <div className="mt-6 pt-5 border-t border-[var(--border)] text-left w-full">
                <div className="flex items-start gap-2.5 text-xs text-[var(--accent)] bg-[var(--accent-soft)] p-3 rounded-xl border border-[rgba(52,211,153,0.3)]">
                  <Info size={16} className="flex-shrink-0 mt-0.5 text-[var(--accent)]" />
                  <span className="text-[11.5px] leading-snug font-medium">
                    &ldquo;Rules compute the number. AI extracts cited facts and writes the explanation.&rdquo;
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: 7 Factor Bars (7 cols) */}
          <div className="lg:col-span-7">
            <GlassCard className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  7-Factor Risk Weight Breakdown
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Total Weight: 100 pts
                </span>
              </div>

              <div className="space-y-3.5">
                {RISK_FACTORS.map((factor) => {
                  const percent = (factor.earned / factor.weight) * 100

                  return (
                    <div key={factor.label} className="group">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-[var(--text)] flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[var(--accent)]" />
                          {factor.label}
                        </span>
                        <span className="font-bold text-[var(--text)] tabular text-[11.5px]">
                          {factor.earned}{' '}
                          <span className="text-[var(--text-muted)] font-normal">/ {factor.weight}</span>
                        </span>
                      </div>

                      {/* Factor Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden border border-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent)] transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Factor Note */}
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-1 group-hover:text-[var(--text-secondary)] transition-colors">
                        {factor.notes}
                      </p>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}
