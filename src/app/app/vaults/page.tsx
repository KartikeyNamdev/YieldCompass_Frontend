import type { Metadata } from 'next'
import { VaultsContent } from '@/components/vaults/VaultsContent'

export const metadata: Metadata = {
  title: 'Fixed-Term Vaults',
  description: 'Deposit USDC into fixed-term senior or junior vault tranches with target APY backed by a first-loss buffer.',
}

export default function VaultsPage() {
  return <VaultsContent />
}
