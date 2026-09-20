/**
 * adapters.ts
 *
 * Single file that maps snake_case backend responses → camelCase TypeScript types.
 * When the backend renames a field, ONLY this file needs to change.
 */

import type {
  Pool,
  RiskResponse,
  ExplainResponse,
  HistoryResponse,
  Series,
  WalletPositions,
} from './schemas'

// ─── Pool ─────────────────────────────────────────────────────────────────────

export interface PoolDto {
  id: string
  name: string
  category: string
  logoInitial: string
  logoColor: string
  headlineApy: number
  realizedApy7d: number
  realizedApy30d: number
  emissionsShare: number
  tvlUsd: number
  riskScore: number
  updatedAt: string
  sparkline30d: number[]
  /** Computed: whether data is stale (>2h old) */
  isStale: boolean
}

export function adaptPool(raw: Pool): PoolDto {
  const updatedMs = new Date(raw.updated_at).getTime()
  const staleThresholdMs = 2 * 60 * 60 * 1000 // 2 hours
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    logoInitial: raw.logo_initial,
    logoColor: raw.logo_color,
    headlineApy: raw.headline_apy,
    realizedApy7d: raw.realized_apy_7d,
    realizedApy30d: raw.realized_apy_30d,
    emissionsShare: raw.emissions_share,
    tvlUsd: raw.tvl_usd,
    riskScore: raw.risk_score,
    updatedAt: raw.updated_at,
    sparkline30d: raw.sparkline_30d,
    isStale: Date.now() - updatedMs > staleThresholdMs,
  }
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export interface RiskFactorDto {
  weight: number
  earned: number
  label: string
  notes: string
}

export interface RiskDto {
  protocolId: string
  computedAt: string
  expiresAt: string
  overallScore: number
  factors: Record<string, RiskFactorDto>
  isExpired: boolean
}

export function adaptRisk(raw: RiskResponse): RiskDto {
  return {
    protocolId: raw.protocol_id,
    computedAt: raw.computed_at,
    expiresAt: raw.expires_at,
    overallScore: raw.overall_score,
    factors: raw.factors,
    isExpired: new Date(raw.expires_at).getTime() < Date.now(),
  }
}

// ─── AI Explanation ───────────────────────────────────────────────────────────

export interface CitationDto {
  id: number
  label: string
  url: string
}

export interface ExplainDto {
  protocolId: string
  generatedAt: string
  explanation: string
  citations: CitationDto[]
}

export function adaptExplain(raw: ExplainResponse): ExplainDto {
  return {
    protocolId: raw.protocol_id,
    generatedAt: raw.generated_at,
    explanation: raw.explanation,
    citations: raw.citations,
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryWindowDto {
  headline: number[]
  realized: number[]
  dates: string[]
}

export interface HistoryDto {
  '7d': HistoryWindowDto
  '30d': HistoryWindowDto
}

export function adaptHistory(raw: HistoryResponse): HistoryDto {
  return {
    '7d': raw['7d'],
    '30d': raw['30d'],
  }
}

// ─── Series ───────────────────────────────────────────────────────────────────

export type SeriesStatus = 'open' | 'active' | 'settled' | 'cancelled'

export interface SeriesDto {
  id: string
  name: string
  status: SeriesStatus
  targetRateBps: number
  termDays: number
  termSecs: number
  minJuniorBps: number
  minRiskScore: number
  depositDeadline: string
  maturityDate: string
  seniorCapacityUsdc: number
  juniorCapacityUsdc: number
  seniorDepositedUsdc: number
  juniorDepositedUsdc: number
  underlyingProtocolId: string
  riskScore: number
  riskScoreExpiresAt: string
  createdAt: string
  updatedAt: string
  settledAt?: string
  realizedApyBps?: number
  /** Derived */
  targetRatePct: number
  riskGatePassed: boolean
  riskGateStale: boolean
}

export function adaptSeries(raw: Series): SeriesDto {
  const riskGateStale = new Date(raw.risk_score_expires_at).getTime() < Date.now()
  const riskGatePassed = !riskGateStale && raw.risk_score >= raw.min_risk_score
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    targetRateBps: raw.target_rate_bps,
    termDays: raw.term_days,
    termSecs: raw.term_secs,
    minJuniorBps: raw.min_junior_bps,
    minRiskScore: raw.min_risk_score,
    depositDeadline: raw.deposit_deadline,
    maturityDate: raw.maturity_date,
    seniorCapacityUsdc: raw.senior_capacity_usdc,
    juniorCapacityUsdc: raw.junior_capacity_usdc,
    seniorDepositedUsdc: raw.senior_deposited_usdc,
    juniorDepositedUsdc: raw.junior_deposited_usdc,
    underlyingProtocolId: raw.underlying_protocol_id,
    riskScore: raw.risk_score,
    riskScoreExpiresAt: raw.risk_score_expires_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    settledAt: raw.settled_at,
    realizedApyBps: raw.realized_apy_bps,
    targetRatePct: raw.target_rate_bps / 100,
    riskGatePassed,
    riskGateStale,
  }
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface PoolPositionDto {
  protocolId: string
  protocolName: string
  amountUsdc: number
  headlineApy: number
  realizedApy30d: number
  entryDate: string
}

export interface VaultPositionDto {
  seriesId: string
  seriesName: string
  tranche: 'senior' | 'junior'
  principalUsdc: number
  status: SeriesStatus
  claimableUsdc: number
}

export interface WalletPositionsDto {
  address: string
  poolPositions: PoolPositionDto[]
  vaultPositions: VaultPositionDto[]
}

export function adaptWalletPositions(raw: WalletPositions): WalletPositionsDto {
  return {
    address: raw.address,
    poolPositions: raw.pool_positions.map((p) => ({
      protocolId: p.protocol_id,
      protocolName: p.protocol_name,
      amountUsdc: p.amount_usdc,
      headlineApy: p.headline_apy,
      realizedApy30d: p.realized_apy_30d,
      entryDate: p.entry_date,
    })),
    vaultPositions: raw.vault_positions.map((v) => ({
      seriesId: v.series_id,
      seriesName: v.series_name,
      tranche: v.tranche,
      principalUsdc: v.principal_usdc,
      status: v.status,
      claimableUsdc: v.claimable_usdc,
    })),
  }
}
