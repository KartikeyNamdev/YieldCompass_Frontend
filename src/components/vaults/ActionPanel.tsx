'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Droplets, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import type { SeriesDto } from '@/lib/api/adapters'
import { useFaucet } from '@/lib/hooks/useFaucet'
import { useNow } from '@/lib/hooks/useNow'
import { useTokenBalance } from '@/lib/hooks/useTokenBalance'
import { useVaultActions } from '@/lib/hooks/useVaultActions'
import { useWalletPositions } from '@/lib/hooks/useWalletPositions'
import { factsOf } from '@/lib/vault/facts'
import { formatCountdown, formatUnits } from '@/lib/vault/format'
import { buildTerms, parseAmount, toUnits, type Tranche } from '@/lib/vault/terms'
import { Countdown } from './Countdown'

/** The chain's clock can trail the browser's by a few seconds; acting earlier than this would be refused. */
export const CLOCK_SKEW_MS = 8_000

interface Props {
  series: SeriesDto
  tranche: Tranche
  amount: string
}

export function ActionPanel({ series, tranche, amount }: Props) {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const actions = useVaultActions(series)
  const balance = useTokenBalance(series.addresses?.underlying_mint)
  const faucet = useFaucet()
  const positions = useWalletPositions(publicKey?.toBase58() ?? null)
  const now = useNow(1000)

  const parsed = parseAmount(amount)
  const facts = useMemo(() => factsOf(series), [series])
  const capacityOk = useMemo(() => (parsed ? buildTerms(facts, tranche, parsed).capacityOk : true), [facts, tranche, parsed])

  const deadline = new Date(series.depositDeadline).getTime()
  const maturity = new Date(series.maturityDate).getTime()
  const depositsOpen = series.status === 'open' && now < deadline
  const canActivate = series.status === 'open' && now >= deadline
  const activateReady = now >= deadline + CLOCK_SKEW_MS
  const canSettle = series.status === 'active' && now >= maturity
  const settleReady = now >= maturity + CLOCK_SKEW_MS
  const secsUntil = (t: number) => Math.max(1, Math.ceil((t - now) / 1000))
  const gateBlocks = !series.riskGatePassed
  const claimable = (positions.data?.vaultPositions ?? []).filter((p) => p.seriesId === series.id && p.claimableUsdc > 0)

  const busy = actions.busy !== null
  const tokens = balance.data ?? 0n

  let depositBlock: string | null = null
  if (!parsed) depositBlock = 'Enter an amount in the term sheet'
  else if (!capacityOk) depositBlock = 'Exceeds the junior buffer'
  else if (publicKey && balance.data === undefined) depositBlock = 'Checking your balance...'
  else if (publicKey && parsed > tokens) depositBlock = 'Not enough test tokens'

  return (
    <section className="card p-5 space-y-4" aria-labelledby="actions-title">
      <h2 id="actions-title" className="text-base font-semibold">
        Actions
      </h2>

      {!series.addresses ? (
        <p className="text-sm text-[var(--text-secondary)]">On-chain actions need the live backend. This is demo data.</p>
      ) : !publicKey ? (
        <button className="btn-primary w-full" onClick={() => setVisible(true)}>
          Connect wallet
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
            <span className="text-[var(--text-secondary)]">Your test tokens</span>
            <span className="font-semibold tabular-nums">{balance.data === undefined ? '...' : formatUnits(tokens, 2)}</span>
          </div>
          <button className="btn-secondary flex w-full items-center justify-center gap-2" disabled={faucet.isPending} onClick={() => faucet.mutate()}>
            {faucet.isPending ? <Loader2 size={14} className="animate-spin" /> : <Droplets size={14} />}
            Get test tokens
          </button>

          {depositsOpen && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Deposits close in <Countdown to={series.depositDeadline} />
              </p>
              <button
                className="btn-primary w-full"
                disabled={busy || depositBlock !== null}
                onClick={() => parsed && actions.deposit(tranche, parsed)}
              >
                {actions.busy === 'deposit' ? 'Depositing...' : `Deposit as ${tranche}`}
              </button>
              {depositBlock && <p className="text-xs text-[var(--text-muted)]">{depositBlock}</p>}
              {gateBlocks && (
                <p className="rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-3 py-2 text-xs text-[var(--warning)]" role="alert">
                  The risk gate currently blocks this series. If it still blocks at the deadline the program will refuse to activate it and it can be cancelled and refunded.
                </p>
              )}
            </div>
          )}

          {canActivate && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                The deposit window has closed. Anyone can ask the program to activate the series; it checks the on-chain risk score first.
              </p>
              <button className="btn-primary w-full" disabled={busy || !activateReady} onClick={() => actions.activate()}>
                {actions.busy === 'activate' ? 'Activating...' : 'Activate series'}
              </button>
              {!activateReady && (
                <p className="text-xs text-[var(--text-muted)]">Ready in {secsUntil(deadline + CLOCK_SKEW_MS)}s (waiting for the network clock to catch up).</p>
              )}
              <button className="btn-secondary w-full" disabled={busy || !activateReady} onClick={() => actions.cancel()}>
                {actions.busy === 'cancel' ? 'Cancelling...' : 'Cancel series (only if activation is blocked)'}
              </button>
            </div>
          )}

          {series.status === 'active' && !canSettle && (
            <p className="text-sm text-[var(--text-secondary)]">
              Funds are deployed. Matures in <Countdown to={series.maturityDate} />.
            </p>
          )}
          {canSettle && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">Matured. The keeper settles automatically; you can also do it yourself.</p>
              <button className="btn-primary w-full" disabled={busy || !settleReady} onClick={() => actions.settle()}>
                {actions.busy === 'settle' ? 'Settling...' : 'Settle series'}
              </button>
              {!settleReady && <p className="text-xs text-[var(--text-muted)]">Ready in {secsUntil(maturity + CLOCK_SKEW_MS)}s (waiting for the network clock to catch up).</p>}
            </div>
          )}

          {(series.status === 'settled' || series.status === 'cancelled') && (
            <div className="space-y-2">
              {claimable.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  {series.status === 'settled' ? 'Nothing to claim for this wallet.' : 'Cancelled. Nothing to refund for this wallet.'}
                </p>
              ) : series.status === 'cancelled' ? (
                <button className="btn-primary w-full" disabled={busy} onClick={() => actions.refund()}>
                  {actions.busy === 'refund' ? 'Refunding...' : `Refund ${formatUnits(toUnits(claimable.reduce((a, p) => a + p.claimableUsdc, 0)), 4)}`}
                </button>
              ) : (
                claimable.map((p) => (
                  <button key={p.tranche} className="btn-primary w-full" disabled={busy} onClick={() => actions.claim(p.tranche)}>
                    {actions.busy === 'claim' ? 'Claiming...' : `Claim ${p.tranche} payout: ${formatUnits(toUnits(p.claimableUsdc), 4)}`}
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
      <p className="sr-only" aria-live="polite">
        {formatCountdown(Math.max(0, deadline - now))}
      </p>
    </section>
  )
}
