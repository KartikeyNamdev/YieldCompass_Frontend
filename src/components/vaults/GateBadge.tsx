import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { SeriesDto } from '@/lib/api/adapters'

/** The on-chain risk gate as it stands: the vault refuses to activate unless the entry is fresh and the score is high enough. */
export function GateBadge({ series }: { series: SeriesDto }) {
  const { riskGatePassed, riskGateStale, riskScore, minRiskScore } = series
  if (series.status !== 'open') return null
  if (riskGatePassed) {
    return (
      <span className="badge badge-green" title={`Risk score ${riskScore} is at least the minimum of ${minRiskScore}`}>
        <ShieldCheck size={12} /> Risk gate passes ({riskScore} / min {minRiskScore})
      </span>
    )
  }
  return (
    <span className="badge badge-red" title="The program will refuse to activate this series">
      <ShieldAlert size={12} /> {riskGateStale ? 'Risk score stale' : `Risk gate blocks (${riskScore} < ${minRiskScore})`}
    </span>
  )
}
