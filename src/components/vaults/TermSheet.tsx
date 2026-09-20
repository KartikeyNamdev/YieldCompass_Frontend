'use client'

import { useMemo } from 'react'
import type { SeriesDto } from '@/lib/api/adapters'
import { factsOf, formatDateTime } from '@/lib/vault/facts'
import { useNow } from '@/lib/hooks/useNow'
import { formatDuration, formatUnits, percent } from '@/lib/vault/format'
import { buildTerms, parseAmount, toUnits, type Tranche } from '@/lib/vault/terms'

interface Props {
  series: SeriesDto
  tranche: Tranche
  onTranche: (t: Tranche) => void
  amount: string
  onAmount: (v: string) => void
}

const TRANCHES: { id: Tranche; label: string; blurb: string }[] = [
  { id: 'senior', label: 'Senior', blurb: 'Paid first, up to a target rate' },
  { id: 'junior', label: 'Junior', blurb: 'First-loss buffer, keeps the upside' },
]

export function TermSheet({ series, tranche, onTranche, amount, onAmount }: Props) {
  const parsed = parseAmount(amount)
  const facts = useMemo(() => factsOf(series), [series])
  const terms = useMemo(() => (parsed ? buildTerms(facts, tranche, parsed) : null), [facts, tranche, parsed])
  const estimate = series.status === 'open'
  const now = useNow(1000)
  const canDeposit = series.status === 'open' && now < new Date(series.depositDeadline).getTime()

  if (!canDeposit) return <SeriesTerms series={series} />

  return (
    <section className="card p-5 space-y-4" aria-labelledby="term-sheet-title">
      <div className="flex items-center justify-between">
        <h2 id="term-sheet-title" className="text-base font-semibold">
          Term sheet
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          Target {percent(series.targetRateBps)} a year over {formatDuration(series.termSecs)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tranche">
        {TRANCHES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={tranche === t.id}
            onClick={() => onTranche(t.id)}
            className={`rounded-xl border px-3 py-2 text-left transition ${
              tranche === t.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="text-sm font-semibold">{t.label}</div>
            <div className="text-xs text-[var(--text-secondary)]">{t.blurb}</div>
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-xs text-[var(--text-secondary)]">Amount (test tokens)</span>
        <input
          className="input mt-1 w-full tabular-nums"
          inputMode="decimal"
          placeholder="100"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          aria-invalid={amount !== '' && !parsed}
        />
        {amount !== '' && !parsed && <span className="mt-1 block text-xs text-[var(--negative)]">Enter a positive number with up to 6 decimals.</span>}
      </label>

      {terms && parsed ? (
        <>
          <p className="text-sm" data-testid="term-sheet-line">
            {tranche === 'senior' && terms.target !== null ? (
              <>
                Deposit <strong>{formatUnits(parsed)}</strong>. Target <strong>{formatUnits(terms.target, 6)}</strong> on{' '}
                <strong>{formatDateTime(series.maturityDate)}</strong>
                {estimate ? ' (estimated maturity)' : ''}. Target rate, not promised.
              </>
            ) : (
              <>
                Deposit <strong>{formatUnits(parsed)}</strong> as first-loss capital. The payout varies: it absorbs losses first and keeps profit above the senior target.
              </>
            )}
          </p>
          {!terms.capacityOk && (
            <p className="rounded-lg border border-[var(--negative)]/40 bg-[var(--negative)]/10 px-3 py-2 text-xs text-[var(--negative)]" role="alert">
              This exceeds the junior buffer. Senior can be at most {formatUnits(terms.maxAdditionalSenior)} more right now.
            </p>
          )}
          <table className="w-full text-sm">
            <caption className="sr-only">Your payout for each underlying result</caption>
            <thead>
              <tr className="text-left text-xs text-[var(--text-secondary)]">
                <th className="pb-1 font-medium">Underlying result</th>
                <th className="pb-1 text-right font-medium">Your payout</th>
                <th className="pb-1 text-right font-medium">vs deposit</th>
              </tr>
            </thead>
            <tbody>
              {terms.scenarios.map((s) => (
                <tr key={s.yieldBps} className="border-t border-[var(--border)]">
                  <td className="py-1.5">{s.yieldBps > 0 ? '+' : ''}{s.yieldBps / 100}%</td>
                  <td className="py-1.5 text-right tabular-nums">{formatUnits(s.payout, 6)}</td>
                  <td className={`py-1.5 text-right tabular-nums ${s.loss > 0n ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}`}>
                    {s.loss > 0n ? `-${formatUnits(s.loss, 6)}` : `+${formatUnits(s.profit, 6)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-xs text-[var(--text-secondary)]">Enter an amount to see the term sheet and what you would receive in each scenario.</p>
      )}
    </section>
  )
}

/** Terms of a series that can no longer take deposits, plus the actual outcome once settled. */
function SeriesTerms({ series }: { series: SeriesDto }) {
  const rows: Array<[string, string]> = [
    ['Senior target', `${percent(series.targetRateBps)} a year over ${formatDuration(series.termSecs)}`],
    ['Junior buffer', `at least ${percent(series.minJuniorBps)} of the total`],
    ['Deposits closed', formatDateTime(series.depositDeadline)],
    [series.status === 'open' ? 'Maturity (if activated now)' : 'Maturity', formatDateTime(series.maturityDate)],
  ]
  const settled = series.status === 'settled' && series.seniorPayoutUsdc !== undefined && series.juniorPayoutUsdc !== undefined
  const seniorTarget = settled ? factsOf(series) : null
  return (
    <section className="card p-5 space-y-4" aria-labelledby="term-sheet-title">
      <h2 id="term-sheet-title" className="text-base font-semibold">
        Series terms
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[var(--text-secondary)]">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {settled && seniorTarget && (
        <div className="grid grid-cols-2 gap-3 text-sm" data-testid="series-outcome">
          <div className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--text-secondary)]">Senior received</div>
            <div className="text-lg font-semibold tabular-nums">{formatUnits(toUnits(series.seniorPayoutUsdc!), 6)}</div>
            <div className="text-xs text-[var(--text-secondary)]">on {formatUnits(seniorTarget.seniorPrincipal, 6)} deposited</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--text-secondary)]">Junior received</div>
            <div className="text-lg font-semibold tabular-nums">{formatUnits(toUnits(series.juniorPayoutUsdc!), 6)}</div>
            <div className="text-xs text-[var(--text-secondary)]">on {formatUnits(seniorTarget.juniorPrincipal, 6)} deposited</div>
          </div>
        </div>
      )}
      {series.status === 'cancelled' && (
        <p className="text-sm text-[var(--text-secondary)]">This series was cancelled before funds were deployed. Depositors can refund their principal 1:1.</p>
      )}
    </section>
  )
}
