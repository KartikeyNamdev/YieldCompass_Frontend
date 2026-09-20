'use client'

import Link from 'next/link'
import { useSeries } from '@/lib/hooks/useSeries'
import { formatDuration, percent } from '@/lib/vault/format'
import { Countdown } from './Countdown'
import { Disclaimer } from './Disclaimer'
import { GateBadge } from './GateBadge'
import { StatusBadge } from './StatusBadge'
import { TrancheBar } from './TrancheBar'

export function VaultsContent() {
  const { data: series = [], isLoading, error } = useSeries()

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Fixed-Term Vaults</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Deposit into a fixed-term series as senior (paid first, target rate) or junior (first-loss buffer). The vault only deploys funds if the strategy&apos;s on-chain risk score is fresh and high enough.
        </p>
        <Disclaimer className="mt-2" />
      </div>

      {isLoading && <div className="card p-8 text-center text-sm text-[var(--text-secondary)]">Loading vaults...</div>}
      {error && <div className="card p-8 text-center text-sm text-[var(--negative)]">Could not load vaults. Please try again.</div>}
      {!isLoading && !error && series.length === 0 && (
        <div className="card p-8 text-center text-sm text-[var(--text-secondary)]">No vault series have been created yet.</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {series.map((s) => (
          <Link key={s.id} href={`/app/vaults/${s.id}`} className="card block space-y-4 p-5 transition hover:-translate-y-0.5" aria-label={`Open ${s.name}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              <StatusBadge status={s.status} depositDeadline={s.depositDeadline} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>
                <span className="text-[var(--text-secondary)]">Target </span>
                <strong>{percent(s.targetRateBps)}</strong> a year
              </span>
              <span>
                <span className="text-[var(--text-secondary)]">Term </span>
                <strong>{formatDuration(s.termSecs)}</strong>
              </span>
              <span>
                <span className="text-[var(--text-secondary)]">Buffer </span>
                <strong>{percent(s.minJuniorBps)}+</strong>
              </span>
            </div>
            <div className="space-y-2">
              <TrancheBar label="Senior" deposited={s.seniorDepositedUsdc} capacity={s.seniorCapacityUsdc} />
              <TrancheBar label="Junior" deposited={s.juniorDepositedUsdc} capacity={s.juniorCapacityUsdc} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
              <GateBadge series={s} />
              {s.status === 'open' && (
                <span>
                  Deposits close in <Countdown to={s.depositDeadline} doneLabel="0s (closed)" />
                </span>
              )}
              {s.status === 'active' && (
                <span>
                  Matures in <Countdown to={s.maturityDate} />
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
