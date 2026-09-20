'use client'

import * as Slider from '@radix-ui/react-slider'
import { useMemo, useState } from 'react'
import type { SeriesDto } from '@/lib/api/adapters'
import { factsOf } from '@/lib/vault/facts'
import { formatUnits } from '@/lib/vault/format'
import { buildTerms, parseAmount, simulateSeries, type Tranche } from '@/lib/vault/terms'

interface Props {
  series: SeriesDto
  tranche: Tranche
  amount: string
}

export function ScenarioSlider({ series, tranche, amount }: Props) {
  const [bps, setBps] = useState(0)
  const facts = useMemo(() => factsOf(series), [series])
  const sim = useMemo(() => simulateSeries(facts, bps), [facts, bps])
  const parsed = parseAmount(amount)
  const mine = useMemo(() => (parsed ? buildTerms(facts, tranche, parsed, [bps]).scenarios[0] : null), [facts, tranche, parsed, bps])
  const empty = facts.seniorPrincipal + facts.juniorPrincipal === 0n

  return (
    <section className="card p-5 space-y-4" aria-labelledby="scenario-title">
      <div className="flex items-center justify-between">
        <h2 id="scenario-title" className="text-base font-semibold">
          Scenario slider
        </h2>
        <span className="text-sm font-semibold tabular-nums" data-testid="scenario-value">
          {bps > 0 ? '+' : ''}
          {(bps / 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        Drag to change how the strategy ends up relative to what was deployed. Uses the same waterfall as the on-chain program.
      </p>

      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={-1000}
        max={1000}
        step={50}
        value={[bps]}
        onValueChange={(v) => setBps(v[0])}
        aria-label="Underlying result in percent"
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-white/10">
          <Slider.Range className="absolute h-full rounded-full bg-[var(--accent)]" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
      </Slider.Root>
      <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
        <span>-10%</span>
        <span>0%</span>
        <span>+10%</span>
      </div>

      {empty ? (
        <p className="text-xs text-[var(--text-secondary)]">No deposits in this series yet. Enter an amount above to preview a deposit.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--text-secondary)]">Senior tranche</div>
            <div className="text-lg font-semibold tabular-nums">{formatUnits(sim.seniorPayout, 4)}</div>
            <div className="text-xs text-[var(--text-secondary)]">target {formatUnits(sim.seniorOwed, 4)}</div>
            {sim.seniorShortfall && <div className="mt-1 text-xs text-[var(--negative)]">Below target: the junior buffer is used up.</div>}
          </div>
          <div className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--text-secondary)]">Junior tranche</div>
            <div className="text-lg font-semibold tabular-nums">{formatUnits(sim.juniorPayout, 4)}</div>
            <div className="text-xs text-[var(--text-secondary)]">deposited {formatUnits(facts.juniorPrincipal, 4)}</div>
            {sim.juniorWipedOut && <div className="mt-1 text-xs text-[var(--negative)]">First-loss buffer wiped out.</div>}
          </div>
        </div>
      )}
      {mine && (
        <p className="text-sm">
          Your {tranche} deposit of {formatUnits(parsed!)} would return{' '}
          <strong className={mine.loss > 0n ? 'text-[var(--negative)]' : 'text-[var(--positive)]'} data-testid="scenario-mine">
            {formatUnits(mine.payout, 4)}
          </strong>
          .
        </p>
      )}
    </section>
  )
}
