import type { Metadata } from 'next'
import { WalletContent } from '@/components/wallet/WalletContent'

export const metadata: Metadata = {
  title: 'My Positions',
  description: 'View your protocol deposits and vault positions. Paste any Solana address — no wallet connection required.',
}

export default function WalletPage() {
  return <WalletContent />
}
