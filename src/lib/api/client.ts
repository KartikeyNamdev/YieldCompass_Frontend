/**
 * client.ts
 *
 * Typed API client. Reads NEXT_PUBLIC_API_URL for the backend base URL.
 * When NEXT_PUBLIC_DEMO_MODE=true, delegates to the mock layer instead.
 *
 * To switch from seed data to the real API:
 *   NEXT_PUBLIC_DEMO_MODE=false
 *   NEXT_PUBLIC_API_URL=https://your-api.example.com
 */

import {
  PoolsResponseSchema,
  RiskResponseSchema,
  ExplainResponseSchema,
  SeriesListResponseSchema,
  WalletPositionsSchema,
} from './schemas'

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
} from './adapters'

import * as mock from './mock'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/v1${path}`
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText} — ${url}`)
  }
  return response.json()
}

// ─── Pools ────────────────────────────────────────────────────────────────────

export async function getPools(profile?: string): Promise<PoolDto[]> {
  if (DEMO_MODE) return mock.mockGetPools(profile)
  const params = profile ? `?profile=${profile}` : ''
  const raw = await apiFetch<unknown>(`/pools${params}`)
  return PoolsResponseSchema.parse(raw).map(adaptPool)
}

export async function getPool(id: string): Promise<PoolDto | null> {
  if (DEMO_MODE) return mock.mockGetPool(id)
  const raw = await apiFetch<unknown>(`/pools/${id}`)
  return adaptPool(PoolsResponseSchema.element.parse(raw))
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getHistory(
  protocolId: string,
  _window?: '7d' | '30d'
): Promise<HistoryDto | null> {
  if (DEMO_MODE) return mock.mockGetHistory(protocolId)
  const raw = await apiFetch<unknown>(`/pools/${protocolId}/history`)
  return adaptHistory(raw as Parameters<typeof adaptHistory>[0])
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export async function getRisk(protocolId: string): Promise<RiskDto | null> {
  if (DEMO_MODE) return mock.mockGetRisk(protocolId)
  const raw = await apiFetch<unknown>(`/risk/${protocolId}`)
  return adaptRisk(RiskResponseSchema.parse(raw))
}

export async function postExplain(protocolId: string): Promise<ExplainDto | null> {
  if (DEMO_MODE) return mock.mockPostExplain(protocolId)
  const raw = await apiFetch<unknown>(`/risk/${protocolId}/explain`, { method: 'POST' })
  return adaptExplain(ExplainResponseSchema.parse(raw))
}

// ─── Series ───────────────────────────────────────────────────────────────────

export async function getSeries(): Promise<SeriesDto[]> {
  if (DEMO_MODE) return mock.mockGetSeries()
  const raw = await apiFetch<unknown>('/series')
  return SeriesListResponseSchema.parse(raw).map(adaptSeries)
}

export async function getSeriesById(id: string): Promise<SeriesDto | null> {
  if (DEMO_MODE) return mock.mockGetSeriesById(id)
  const raw = await apiFetch<unknown>(`/series/${id}`)
  return adaptSeries(SeriesListResponseSchema.element.parse(raw))
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export async function getWalletPositions(address: string): Promise<WalletPositionsDto | null> {
  if (DEMO_MODE) return mock.mockGetWalletPositions(address)
  const raw = await apiFetch<unknown>('/wallet/positions', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
  return adaptWalletPositions(WalletPositionsSchema.parse(raw))
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth() {
  if (DEMO_MODE) return mock.mockGetHealth()
  return apiFetch<{ status: string; timestamp: string }>('/health')
}
