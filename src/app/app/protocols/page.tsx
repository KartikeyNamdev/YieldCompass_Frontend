import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Protocols',
  description: 'All tracked Solana DeFi protocols with risk scores and realized APY data.',
}

export default function ProtocolsPage() {
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Protocols</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">Browse all tracked Solana protocols. Click any row on the Explorer to view details.</p>
    </div>
  )
}
