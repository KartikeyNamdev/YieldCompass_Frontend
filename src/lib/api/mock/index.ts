/**
 * mock/index.ts
 *
 * Demo mode data layer. Reads from /data/seed/*.json files.
 * Activated when NEXT_PUBLIC_DEMO_MODE=true.
 * Simulates network latency with a small delay.
 */

import poolsRaw from '../../../../data/seed/pools.json'
import riskRaw from '../../../../data/seed/risk.json'
import riskExplainRaw from '../../../../data/seed/risk-explain.json'
import seriesRaw from '../../../../data/seed/series.json'
import positionsRaw from '../../../../data/seed/positions.json'
import historyRaw from '../../../../data/seed/history.json'

import {
  PoolsResponseSchema,
  RiskResponseSchema,
  ExplainResponseSchema,
  SeriesListResponseSchema,
  WalletPositionsSchema,
} from '../schemas'

import {
  adaptPool,
  adaptRisk,
  adaptExplain,
  adaptSeries,
  adaptWalletPositions,
  adaptHistory,
  type PoolDto,
  type RiskDto,
  type ExplainDto,
  type SeriesDto,
  type WalletPositionsDto,
  type HistoryDto,
} from '../adapters'

const SIMULATED_DELAY_MS = 350

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockGetPools(_profile?: string): Promise<PoolDto[]> {
  await delay(SIMULATED_DELAY_MS)
  const pools = PoolsResponseSchema.parse(poolsRaw)
  return pools.map(adaptPool)
}

export async function mockGetPool(id: string): Promise<PoolDto | null> {
  await delay(SIMULATED_DELAY_MS)
  const pools = PoolsResponseSchema.parse(poolsRaw)
  const pool = pools.find((p) => p.id === id)
  return pool ? adaptPool(pool) : null
}

export async function mockGetHistory(protocolId: string): Promise<HistoryDto | null> {
  await delay(SIMULATED_DELAY_MS)
  const allHistory = historyRaw as Record<string, { '7d': { headline: number[]; realized: number[]; dates: string[] }; '30d': { headline: number[]; realized: number[]; dates: string[] } }>
  const raw = allHistory[protocolId]
  if (!raw) return null
  return adaptHistory(raw)
}

export async function mockGetRisk(protocolId: string): Promise<RiskDto | null> {
  await delay(SIMULATED_DELAY_MS)
  const allRisk = riskRaw as Record<string, unknown>
  const raw = allRisk[protocolId]
  if (!raw) return null
  const parsed = RiskResponseSchema.parse(raw)
  return adaptRisk(parsed)
}

export async function mockPostExplain(protocolId: string): Promise<ExplainDto | null> {
  await delay(SIMULATED_DELAY_MS * 2) // Simulate AI generation latency
  const allExplain = riskExplainRaw as Record<string, unknown>
  const raw = allExplain[protocolId]
  if (!raw) return null
  const parsed = ExplainResponseSchema.parse(raw)
  return adaptExplain(parsed)
}

export async function mockGetSeries(): Promise<SeriesDto[]> {
  await delay(SIMULATED_DELAY_MS)
  const series = SeriesListResponseSchema.parse(seriesRaw)
  return series.map(adaptSeries)
}

export async function mockGetSeriesById(id: string): Promise<SeriesDto | null> {
  await delay(SIMULATED_DELAY_MS)
  const series = SeriesListResponseSchema.parse(seriesRaw)
  const found = series.find((s) => s.id === id)
  return found ? adaptSeries(found) : null
}

export async function mockGetWalletPositions(address: string): Promise<WalletPositionsDto | null> {
  await delay(SIMULATED_DELAY_MS)
  const allPositions = positionsRaw as Record<string, unknown>
  const raw = allPositions[address]
  if (!raw) {
    // Return empty positions for unknown addresses
    return { address, poolPositions: [], vaultPositions: [] }
  }
  const parsed = WalletPositionsSchema.parse(raw)
  return adaptWalletPositions(parsed)
}

export async function mockGetHealth() {
  await delay(50)
  return { status: 'ok', timestamp: new Date().toISOString() }
}
