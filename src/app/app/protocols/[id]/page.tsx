import type { Metadata } from 'next'
import { ProtocolDetailContent } from '@/components/protocol/ProtocolDetailContent'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Protocol: ${id.replace(/-/g, ' ')}`,
    description: `Risk score, realized APY, and detailed breakdown for ${id} on Solana.`,
  }
}

export default async function ProtocolDetailPage({ params }: Props) {
  const { id } = await params
  return <ProtocolDetailContent id={id} />
}
