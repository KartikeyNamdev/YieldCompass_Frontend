'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useState } from 'react'
import type { VaultPositionDto } from '@/lib/api/adapters'
import { useSeries } from '@/lib/hooks/useSeries'
import { useVaultActions } from '@/lib/hooks/useVaultActions'
import { useWalletPositions } from '@/lib/hooks/useWalletPositions'
import { Disclaimer } from '@/components/vaults/Disclaimer'
import { StatusBadge } from '@/components/vaults/StatusBadge'
import { formatUsdc, shortAddress } from '@/lib/vault/format'

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function ClaimButton({ position, isOwner }: { position: VaultPositionDto; isOwner: boolean }) {
  const { data: all = [] } = useSeries()
  const series = all.find((s) => s.id === position.seriesId)
  const actions = useVaultActions(series)
  if (position.claimableUsdc <= 0) return <span className="text-xs text-[var(--text-muted)]">{position.status === 'settled' || position.status === 'cancelled' ? 'Done' : '-'}</span>
  if (!isOwner) return <span className="text-xs text-[var(--text-secondary)]">{formatUsdc(position.claimableUsdc, 4)} claimable</span>
  const cancelled = position.status === 'cancelled'
  return (
    <button
      className="btn-primary h-8 px-3 text-xs"
      disabled={!actions.ready || actions.busy !== null}
      onClick={() => (cancelled ? actions.refund() : actions.claim(position.tranche))}
    >
      {cancelled ? 'Refund' : 'Claim'} {formatUsdc(position.claimableUsdc, 4)}
    </button>
  )
}

export function WalletContent() {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [input, setInput] = useState('')
  const connected = publicKey?.toBase58() ?? null
  const typed = input.trim()
  const address = typed || connected
  const invalid = typed !== '' && !BASE58.test(typed)
  const { data, isLoading, error } = useWalletPositions(address && !invalid ? address : null)
  const isOwner = !!connected && address === connected

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Positions</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">View vault positions for any Solana address, or connect your wallet to claim.</p>
        <Disclaimer className="mt-2" />
      </div>

      <div className="card space-y-3 p-5">
        <label className="block">
          <span className="text-xs text-[var(--text-secondary)]">Address (leave empty to use your connected wallet)</span>
          <input
            className="input mt-1 w-full font-mono text-sm"
            placeholder={connected ?? 'Paste a Solana address'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={invalid}
            spellCheck={false}
          />
        </label>
        {invalid && <p className="text-xs text-[var(--negative)]">That does not look like a Solana address.</p>}
        {!address && (
          <button className="btn-primary" onClick={() => setVisible(true)}>
            Connect wallet
          </button>
        )}
      </div>

      {address && !invalid && (
        <div className="card overflow-x-auto p-5">
          <h2 className="mb-3 text-base font-semibold">Vault positions for {shortAddress(address)}</h2>
          {isLoading && <p className="text-sm text-[var(--text-secondary)]">Loading...</p>}
          {error && <p className="text-sm text-[var(--negative)]">Could not load positions. Please try again.</p>}
          {data && data.vaultPositions.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No vault positions for this address.</p>}
          {data && data.vaultPositions.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--text-secondary)]">
                  <th className="pb-2 font-medium">Series</th>
                  <th className="pb-2 font-medium">Tranche</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Principal</th>
                  <th className="pb-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.vaultPositions.map((p) => (
                  <tr key={`${p.seriesId}-${p.tranche}`} className="border-t border-[var(--border)]">
                    <td className="py-2">
                      <Link href={`/app/vaults/${p.seriesId}`} className="text-[var(--accent)]">
                        {p.seriesName}
                      </Link>
                    </td>
                    <td className="py-2 capitalize">{p.tranche}</td>
                    <td className="py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatUsdc(p.principalUsdc, 4)}</td>
                    <td className="py-2 text-right">
                      <ClaimButton position={p} isOwner={isOwner} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-4 text-xs text-[var(--text-muted)]">Positions in external protocols are not read yet; only YieldCompass vault positions are shown.</p>
        </div>
      )}
    </div>
  )
}
