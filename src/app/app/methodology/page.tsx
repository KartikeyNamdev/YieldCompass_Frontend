import type { Metadata } from 'next'
import { MethodologyContent } from '@/components/methodology/MethodologyContent'

export const metadata: Metadata = {
  title: 'Risk Methodology',
  description: 'How YieldCompass computes its 0-100 risk scores: 7 factors, weights, data sources, and honest limitations.',
}

export default function MethodologyPage() {
  return <MethodologyContent />
}
