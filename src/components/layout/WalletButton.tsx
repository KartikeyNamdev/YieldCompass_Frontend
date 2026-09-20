'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Copy, LogOut, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { shortAddress } from '@/lib/vault/format'

export function WalletButton() {
  const { publicKey, connecting, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  if (!publicKey) {
    return (
      <button
        id="wallet-connect-btn"
        className="btn-primary flex items-center gap-2 h-8 px-3 text-xs"
        aria-label="Connect wallet"
        disabled={connecting}
        onClick={() => setVisible(true)}
      >
        <Wallet size={13} />
        <span className="hidden sm:inline">{connecting ? 'Connecting...' : 'Connect'}</span>
      </button>
    )
  }

  const address = publicKey.toBase58()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button id="wallet-connect-btn" className="btn-secondary flex items-center gap-2 h-8 px-3 text-xs" aria-label="Wallet menu">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {shortAddress(address)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-40 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] p-1 text-sm shadow-xl"
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-white/5"
            onSelect={() => {
              navigator.clipboard.writeText(address)
              toast.success('Address copied')
            }}
          >
            <Copy size={14} /> Copy address
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-white/5"
            onSelect={() => disconnect()}
          >
            <LogOut size={14} /> Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
