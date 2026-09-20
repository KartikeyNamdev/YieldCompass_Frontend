'use client'

import { Tooltip } from '@/components/ui/Tooltip'

interface GapBarProps {
  headlineApy: number
  realizedApy: number
  maxApy?: number
}

export function GapBar({ headlineApy, realizedApy, maxApy = 20 }: GapBarProps) {
  const realizedPct = Math.min((realizedApy / maxApy) * 100, 100)
  const headlinePct = Math.min((headlineApy / maxApy) * 100, 100)
  const gapPct = Math.max(headlinePct - realizedPct, 0)
  const gap = headlineApy - realizedApy

  return (
    <Tooltip
      content={`Headline APY: ${headlineApy.toFixed(1)}%. Realized APY: ${realizedApy.toFixed(1)}%. Gap: ${gap.toFixed(1)}% (${gap > 0 ? 'not actually earned' : 'on track'}).`}
      showIcon={false}
    >
      <div className="w-full min-w-[80px]">
        <div className="gap-bar-container" role="progressbar" aria-valuemin={0} aria-valuemax={maxApy} aria-valuenow={realizedApy} aria-label={`Realized: ${realizedApy.toFixed(1)}%`}>
          <div className="flex h-full">
            <div
              className="gap-bar-realized"
              style={{ width: `${realizedPct}%` }}
            />
            {gapPct > 0 && (
              <div
                className="gap-bar-gap"
                style={{ width: `${gapPct}%` }}
                aria-label={`Gap: ${gap.toFixed(1)}%`}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9.5px] text-[var(--color-text-secondary)] tabular">
            {realizedApy.toFixed(1)}%
          </span>
          {gap > 0.1 && (
            <span className="text-[9.5px] text-[var(--color-negative)] tabular font-medium">
              -{gap.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </Tooltip>
  )
}
