import type { Metadata } from 'next'
import { SeriesDetailContent } from '@/components/vaults/SeriesDetailContent'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Vault Series: ${id}`,
    description: `Term sheet, deposit panel, risk gate, and scenario analysis for vault series ${id}.`,
  }
}

export default async function VaultSeriesPage({ params }: Props) {
  const { id } = await params
  return <SeriesDetailContent id={id} />
}
