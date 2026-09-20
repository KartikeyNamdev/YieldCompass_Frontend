import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yield Explorer',
  description: 'See what Solana DeFi pools actually paid — not just what they advertise. Risk-scored, realized APY tracked.',
}

export default function ExplorerPage() {
  return <ExplorerContent />
}

import { ExplorerContent } from '@/components/explorer/ExplorerContent'
