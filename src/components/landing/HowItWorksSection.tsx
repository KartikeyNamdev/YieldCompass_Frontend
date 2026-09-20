'use client'

import React from 'react'
import { Activity, ShieldCheck, LockKeyhole } from 'lucide-react'
import { SectionHeading } from '@/components/brand/SectionHeading'
import { NodeDiagram, type DiagramNode } from '@/components/brand/NodeDiagram'
import { GlassCard } from '@/components/brand/GlassCard'

const PIPELINE_NODES: DiagramNode[] = [
  {
    id: 'measure',
    label: '1. Measure Realized APY',
    sub: 'Isolate organic fee yield from volatile bonus tokens',
    icon: <Activity size={20} />,
    status: 'success',
    badge: 'Step 1: Truth',
  },
  {
    id: 'score',
    label: '2. Deterministic Risk Score',
    sub: '0-100 score across 7 audited factors with cited sources',
    icon: <ShieldCheck size={20} />,
    status: 'active',
    badge: 'Step 2: Analysis',
  },
  {
    id: 'gate-vault',
    label: '3. Risk Gate & Vault',
    sub: 'Funds deploy only if score is high and fresh; first-loss buffer protects senior',
    icon: <LockKeyhole size={20} />,
    status: 'success',
    badge: 'Step 3: Protection',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-[var(--bg-elevated)]/30 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          eyebrow="How It Works"
          title="From raw pool telemetry to risk-gated vaults."
          subtitle="A deterministic pipeline that separates real economic yield from protocol noise and enforces safety parameters before capital moves."
          align="center"
          className="mb-14"
        />

        {/* Node Diagram Visual Flow */}
        <div className="mb-12">
          <NodeDiagram nodes={PIPELINE_NODES} />
        </div>

        {/* Detailed 3-Column Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[rgba(52,211,153,0.3)] text-[var(--accent)] flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text)] mb-2">
              1. Measure Realized Yield
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              We sample on-chain pool reserve states continuously. Realized APY measures what depositors actually received in stable value over 7 and 30 days, discounting inflationary emissions.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[rgba(52,211,153,0.3)] text-[var(--accent)] flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text)] mb-2">
              2. Score with Cited Sources
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Deterministic mathematical formulas evaluate 7 risk dimensions. AI is restricted to extracting cited factual claims from verified public audit reports and governance registries.
            </p>
          </GlassCard>

          <GlassCard featured className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[rgba(52,211,153,0.3)] text-[var(--accent)] flex items-center justify-center mb-4">
              <LockKeyhole size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text)] mb-2">
              3. Gate & Deploy to Vault
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Fixed-term vaults deploy assets into underlying protocols only when the automated Risk Gate passes (score &ge; minimum threshold and fresh data). A junior buffer absorbs first losses.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
