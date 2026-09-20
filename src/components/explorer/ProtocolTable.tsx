'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, ArrowUpDown, AlertCircle, Loader2 } from 'lucide-react'
import type { PoolDto } from '@/lib/api/adapters'
import type { Profile } from '@/lib/hooks/useProtocols'
import { GapBar } from '@/components/ui/GapBar'
import { RiskRing } from '@/components/ui/RiskRing'
import { Tooltip } from '@/components/ui/Tooltip'
import { SearchInput } from '@/components/brand/SearchInput'
import { formatDistanceToNow } from 'date-fns'

const PROFILE_MIN_SCORE: Record<Profile, number> = {
  conservative: 75,
  balanced: 55,
  aggressive: 0,
}

function formatTVL(usd: number): string {
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`
  return `$${usd.toFixed(0)}`
}

type SortKey = 'rank' | 'headlineApy' | 'realizedApy7d' | 'realizedApy30d' | 'riskScore' | 'tvlUsd' | 'emissionsShare'
type SortDir = 'asc' | 'desc'

function getRiskAdjustedScore(pool: PoolDto) {
  return pool.realizedApy30d * (pool.riskScore / 100)
}

interface ProtocolTableProps {
  pools: PoolDto[]
  profile: Profile
  isLoading: boolean
  error: Error | null
}


function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey
  sortKey: SortKey
  sortDir: SortDir
}) {
  if (sortKey !== col) return <ArrowUpDown size={11} className="opacity-30 ml-0.5" />
  return sortDir === 'asc' ? (
    <ArrowUp size={11} className="ml-0.5 text-[var(--accent)]" />
  ) : (
    <ArrowDown size={11} className="ml-0.5 text-[var(--accent)]" />
  )
}

function ColHeader({
  col,
  label,
  tooltip,
  align = 'left',
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey
  label: string
  tooltip?: string
  align?: 'left' | 'right'
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}) {
  return (
    <th
      className={`px-3 py-3 text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(col)}
      aria-sort={sortKey === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-0.5">
        {tooltip ? (
          <Tooltip content={tooltip}>
            <span>{label}</span>
          </Tooltip>
        ) : (
          label
        )}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </th>
  )
}

export function ProtocolTable({ pools, profile, isLoading, error }: ProtocolTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const minScore = PROFILE_MIN_SCORE[profile]

  const filteredAndSorted = useMemo(() => {
    let filtered = pools
      .filter((p) => p.riskScore >= minScore)
      .filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      )

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number
      if (sortKey === 'rank') {
        aVal = getRiskAdjustedScore(a)
        bVal = getRiskAdjustedScore(b)
        // Rank 1 = highest score, so invert for 'asc'
        return sortDir === 'asc' ? bVal - aVal : aVal - bVal
      }
      aVal = a[sortKey] as number
      bVal = b[sortKey] as number
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [pools, minScore, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'rank' ? 'asc' : 'desc')
    }
  }

  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-10 justify-center text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
          <span className="text-sm">Loading protocols…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 flex items-center gap-3 text-[var(--negative)]">
        <AlertCircle size={18} />
        <div>
          <p className="font-semibold text-sm">Failed to load protocols</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          {filteredAndSorted.length} Protocols
        </h2>
        <div className="w-48">
          <SearchInput
            id="protocol-search"
            placeholder="Filter protocols…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            aria-label="Filter protocols by name or category"
          />
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="px-6 py-12 text-center text-[var(--color-text-secondary)] text-sm">
          No protocols match your current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]" role="grid" aria-label="Protocol yield comparison table">
            <thead className="bg-[var(--surface-strong)]">
              <tr>
                <ColHeader col="rank" label="Rank" tooltip="Ranked by Realized APY × (Risk Score ÷ 100). Higher = better risk-adjusted return." sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 text-left text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Protocol</th>
                <ColHeader col="headlineApy" label="Headline APY" tooltip="The APY shown on the protocol's own dashboard. Includes token emissions and incentives." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <ColHeader col="realizedApy7d" label="Realized 7d" tooltip="The APY depositors actually received over the last 7 days, excluding unearned token emissions." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <ColHeader col="realizedApy30d" label="Realized 30d" tooltip="The APY depositors actually received over the last 30 days. More reliable than 7d." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 text-left text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  <Tooltip content="The thin bar shows Realized APY (indigo) vs the gap to Headline APY (red). Longer red = bigger overstatement.">
                    <span>Gap</span>
                  </Tooltip>
                </th>
                <ColHeader col="emissionsShare" label="Emissions %" tooltip="What percentage of the Headline APY comes from token rewards (emissions), not real interest. High % = more risk." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <ColHeader col="tvlUsd" label="TVL" tooltip="Total Value Locked — how much money is deposited in the protocol right now." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <ColHeader col="riskScore" label="Risk Score" tooltip="A 0-100 score (higher = safer) based on 7 weighted factors: audits, TVL, yield source, history, oracle risk, liquidity, and governance." align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 text-right text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredAndSorted.map((pool, idx) => {
                const rank = idx + 1
                const hasMostlyEmissions = pool.emissionsShare > 50
                const updatedAgo = formatDistanceToNow(new Date(pool.updatedAt), { addSuffix: true })

                return (
                  <tr
                    key={pool.id}
                    className="protocol-row"
                    onClick={() => router.push(`/app/protocols/${pool.id}`)}
                    role="row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/app/protocols/${pool.id}`)
                      }
                    }}
                    aria-label={`${pool.name}: ${pool.realizedApy30d.toFixed(1)}% realized APY, risk score ${pool.riskScore}`}
                  >
                    {/* Rank */}
                    <td className="px-3 py-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[11px] font-bold flex items-center justify-center">
                        {rank}
                      </span>
                    </td>

                    {/* Protocol */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                          style={{ background: pool.logoColor }}
                          aria-hidden="true"
                        >
                          {pool.logoInitial}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {pool.name}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)]">
                            {pool.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Headline APY */}
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold tabular text-[var(--color-text-primary)]">
                        {pool.headlineApy.toFixed(1)}%
                      </span>
                    </td>

                    {/* Realized 7d */}
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold tabular text-[var(--color-positive)]">
                        {pool.realizedApy7d.toFixed(1)}%
                      </span>
                    </td>

                    {/* Realized 30d */}
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold tabular text-[var(--color-positive)]">
                        {pool.realizedApy30d.toFixed(1)}%
                      </span>
                    </td>

                    {/* Gap bar */}
                    <td className="px-3 py-3" style={{ minWidth: 110 }}>
                      <GapBar headlineApy={pool.headlineApy} realizedApy={pool.realizedApy30d} />
                    </td>

                    {/* Emissions % */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-sm tabular font-semibold ${
                            hasMostlyEmissions
                              ? 'text-[var(--color-negative)]'
                              : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {pool.emissionsShare}%
                        </span>
                        {hasMostlyEmissions && (
                          <Tooltip content="More than half of this protocol's headline APY comes from token rewards (emissions), not real lending interest. These emissions can end or lose value.">
                            <span className="badge badge-red text-[10px] whitespace-nowrap">
                              Mostly token rewards
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </td>

                    {/* TVL */}
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm tabular text-[var(--color-text-primary)]">
                        {formatTVL(pool.tvlUsd)}
                      </span>
                    </td>

                    {/* Risk score ring */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end">
                        <RiskRing score={pool.riskScore} size={40} strokeWidth={3.5} />
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">
                          {updatedAgo}
                        </span>
                        {pool.isStale && (
                          <span className="badge badge-amber text-[10px]">Stale</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
