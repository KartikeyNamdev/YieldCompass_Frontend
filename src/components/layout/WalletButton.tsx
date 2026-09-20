'use client'

import { Wallet } from 'lucide-react'

export function WalletButton() {
  // F5 will replace this with the real wallet adapter
  return (
    <button
      id="wallet-connect-btn"
      className="btn-primary flex items-center gap-2 h-8 px-3 text-xs"
      aria-label="Connect wallet"
    >
      <Wallet size={13} />
      <span className="hidden sm:inline">Connect</span>
    </button>
  )
}
