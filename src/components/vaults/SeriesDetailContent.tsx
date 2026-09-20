'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useNow } from '@/lib/hooks/useNow'
import { useSeriesById } from '@/lib/hooks/useSeriesById'
import { explorerAddress } from '@/lib/chain/config'
import { formatDateTime } from '@/lib/vault/facts'
import { formatDuration, percent, shortAddress } from '@/lib/vault/format'
import type { Tranche } from '@/lib/vault/terms'
import { ActionPanel } from './ActionPanel'
import { Countdown } from './Countdown'
import { Disclaimer } from './Disclaimer'
import { GateBadge } from './GateBadge'
import { ScenarioSlider } from './ScenarioSlider'
import { StatusBadge } from './StatusBadge'
import { TermSheet } from './TermSheet'
import { TrancheBar } from './TrancheBar'

export function SeriesDetailContent({ id }: { id: string }) {
  const { data: series, isLoading, error } = useSeriesById(id)
  const [tranche, setTranche] = useState<Tranche>('senior')
  const [amount, setAmount] = useState('100')
  const now = useNow(1000)

  if (isLoading) return <div className="mx-auto max-w-6xl py-10 text-sm text-[var(--text-secondary)]">Loading series...</div>
  if (error) return <div className="mx-auto max-w-6xl py-10 text-sm text-[var(--negative)]">Could not load this series. Please try again.</div>
  if (!series) {
    return (
      <div className="mx-auto max-w-6xl py-10 space-y-3">
        <p className="text-sm">Series {id} does not exist.</p>
        <Link href="/app/vaults" className="text-sm text-[var(--accent)]">Back to vaults</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6 animate-fade-in">
      <Link href="/app/vaults" className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">
        <ArrowLeft size={12} /> All vaults
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{series.name}</h1>
          <StatusBadge status={series.status} depositDeadline={series.depositDeadline} />
          <GateBadge series={series} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Target {percent(series.targetRateBps)} a year for senior, {formatDuration(series.termSecs)} term, backed by a first-loss buffer of at least{' '}
          {percent(series.minJuniorBps)}.
          {series.status === 'open' && now < new Date(series.depositDeadline).getTime() && (
            <>
              {' '}Deposits close in <Countdown to={series.depositDeadline} />.
            </>
          )}
          {series.status === 'open' && now >= new Date(series.depositDeadline).getTime() && ' The deposit window has closed; the series is waiting to be activated or cancelled.'}
        </p>
        <Disclaimer />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TermSheet series={series} tranche={tranche} onTranche={setTranche} amount={amount} onAmount={setAmount} />
          {(series.status === 'open' || series.status === 'active') && (
            <ScenarioSlider
              series={series}
              tranche={tranche}
              amount={series.status === 'open' && now < new Date(series.depositDeadline).getTime() ? amount : ''}
            />
          )}
        </div>
        <div className="space-y-6">
          <ActionPanel series={series} tranche={tranche} amount={amount} />

          <section className="card p-5 space-y-3" aria-labelledby="fill-title">
            <h2 id="fill-title" className="text-base font-semibold">Tranches</h2>
            <TrancheBar label="Senior" deposited={series.seniorDepositedUsdc} capacity={series.seniorCapacityUsdc} />
            <TrancheBar label="Junior" deposited={series.juniorDepositedUsdc} capacity={series.juniorCapacityUsdc} />
            {series.status === 'settled' && series.realizedApyBps !== undefined && (
              <p className="text-xs text-[var(--text-secondary)]">
                Whole-series return: {(series.realizedApyBps / 100).toFixed(2)}%{series.termSecs < 7 * 86_400 ? ' over the short demo term' : ' a year'}.
              </p>
            )}
          </section>

          <section className="card p-5 space-y-2 text-sm" aria-labelledby="gate-title">
            <h2 id="gate-title" className="text-base font-semibold">Risk gate</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-[var(--text-secondary)]">Strategy</dt>
              <dd className="text-right">{series.underlyingProtocolId}</dd>
              <dt className="text-[var(--text-secondary)]">On-chain score</dt>
              <dd className="text-right tabular-nums">{series.riskScore} (minimum {series.minRiskScore})</dd>
              <dt className="text-[var(--text-secondary)]">Score expires</dt>
              <dd className="text-right">{series.riskScoreExpiresAt.startsWith('1970') ? 'unknown' : formatDateTime(series.riskScoreExpiresAt)}</dd>
            </dl>
            {series.pubkey && (
              <a className="inline-flex items-center gap-1 text-xs text-[var(--accent)]" href={explorerAddress(series.pubkey)} target="_blank" rel="noopener noreferrer">
                Series account {shortAddress(series.pubkey)} <ExternalLink size={11} />
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
