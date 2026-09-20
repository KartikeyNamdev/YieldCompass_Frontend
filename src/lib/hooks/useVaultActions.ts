'use client'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import type { Transaction } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { SeriesDto } from '@/lib/api/adapters'
import { explorerTx } from '@/lib/chain/config'
import { explainTxError } from '@/lib/chain/errors'
import { buildActivateTx, buildCancelTx, buildClaimTx, buildDepositTx, buildRefundTx, buildSettleTx, type Tranche } from '@/lib/chain/tx'

export type VaultAction = 'deposit' | 'claim' | 'activate' | 'settle' | 'cancel' | 'refund'

/** Sign-and-send helpers for one series. Every failure is turned into a toast with a plain-language reason. */
export function useVaultActions(series: SeriesDto | null | undefined) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<VaultAction | null>(null)

  const ready = !!publicKey && !!series?.pubkey && !!series.addresses
  const ref = series?.pubkey && series.addresses ? { seriesPubkey: series.pubkey, addresses: series.addresses } : null

  const refresh = useCallback(() => {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ['series'] })
      qc.invalidateQueries({ queryKey: ['wallet-positions'] })
      qc.invalidateQueries({ queryKey: ['token-balance'] })
    }
    invalidate()
    setTimeout(invalidate, 12_000) // the indexer catches up within ~10s
  }, [qc])

  const run = useCallback(
    async (action: VaultAction, label: string, build: () => Promise<Transaction>): Promise<boolean> => {
      if (!ready) return false
      setBusy(action)
      const toastId = toast.loading(`${label}: confirm in your wallet...`)
      try {
        const tx = await build()
        const signature = await sendTransaction(tx, connection)
        toast.loading(`${label}: waiting for confirmation...`, { id: toastId })
        await connection.confirmTransaction(
          { signature, blockhash: tx.recentBlockhash!, lastValidBlockHeight: tx.lastValidBlockHeight! },
          'confirmed',
        )
        toast.success(`${label}: done`, {
          id: toastId,
          action: { label: 'View', onClick: () => window.open(explorerTx(signature), '_blank', 'noopener') },
        })
        refresh()
        return true
      } catch (e) {
        toast.error(explainTxError(e), { id: toastId })
        return false
      } finally {
        setBusy(null)
      }
    },
    [ready, sendTransaction, connection, refresh],
  )

  return {
    ready,
    busy,
    deposit: (tranche: Tranche, amount: bigint) =>
      run('deposit', `Deposit as ${tranche}`, () => buildDepositTx(connection, publicKey!, ref!, tranche, amount)),
    claim: (tranche: Tranche) => run('claim', `Claim ${tranche} payout`, () => buildClaimTx(connection, publicKey!, ref!, tranche)),
    activate: () => run('activate', 'Activate series', () => buildActivateTx(connection, publicKey!, ref!)),
    settle: () => run('settle', 'Settle series', () => buildSettleTx(connection, publicKey!, ref!)),
    cancel: () => run('cancel', 'Cancel series', () => buildCancelTx(connection, publicKey!, ref!)),
    refund: () => run('refund', 'Refund deposit', () => buildRefundTx(connection, publicKey!, ref!)),
  }
}
