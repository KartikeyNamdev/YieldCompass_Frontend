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
  HistoryResponseSchema,
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

import * as backend from './backend'
import * as mock from './mock'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
// Harmless for normal hosts; stops free ngrok tunnels from answering API calls with an HTML warning page.
const BASE_HEADERS = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/v1${path}`
  const response = await fetch(url, {
    headers: { ...BASE_HEADERS, ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText} — ${url}`)
  }
  return response.json()
}

/** Like apiFetch, but a 404 means "does not exist" and returns null instead of throwing. */
async function apiFetchOrNull<T>(path: string, options?: RequestInit): Promise<T | null> {
  const url = `${API_BASE}/v1${path}`
  const response = await fetch(url, {
    headers: { ...BASE_HEADERS, ...options?.headers },
    ...options,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText} — ${url}`)
  return response.json()
}

// ─── Pools ────────────────────────────────────────────────────────────────────

export async function getPools(profile?: string): Promise<PoolDto[]> {
  if (DEMO_MODE) return mock.mockGetPools(profile)
  const params = profile ? `?profile=${profile}` : ''
  const raw = await apiFetch<{ data: backend.BackendPool[] }>(`/pools${params}`)
  return PoolsResponseSchema.parse(backend.toPools(raw)).map(adaptPool)
}

export async function getPool(id: string): Promise<PoolDto | null> {
  if (DEMO_MODE) return mock.mockGetPool(id)
  const raw = await apiFetchOrNull<backend.BackendPool>(`/pools/${id}`)
  return raw ? adaptPool(PoolsResponseSchema.element.parse(backend.toPool(raw))) : null
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getHistory(
  protocolId: string,
  _window?: '7d' | '30d'
): Promise<HistoryDto | null> {
  if (DEMO_MODE) return mock.mockGetHistory(protocolId)
  // both windows are fetched together because the UI toggles between them without another request
  const [h7, h30] = await Promise.all([
    apiFetchOrNull<backend.BackendHistory>(`/pools/${protocolId}/history?window=7d`),
    apiFetchOrNull<backend.BackendHistory>(`/pools/${protocolId}/history?window=30d`),
  ])
  return h7 && h30 ? adaptHistory(HistoryResponseSchema.parse(backend.toHistory(h7, h30))) : null
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export async function getRisk(protocolId: string): Promise<RiskDto | null> {
  if (DEMO_MODE) return mock.mockGetRisk(protocolId)
  const raw = await apiFetchOrNull<backend.BackendRisk>(`/risk/${protocolId}`)
  return raw ? adaptRisk(RiskResponseSchema.parse(backend.toRisk(raw))) : null
}

export async function postExplain(protocolId: string): Promise<ExplainDto | null> {
  if (DEMO_MODE) return mock.mockPostExplain(protocolId)
  const raw = await apiFetchOrNull<backend.BackendExplain>(`/risk/${protocolId}/explain`, { method: 'POST' })
  return raw ? adaptExplain(ExplainResponseSchema.parse(backend.toExplain(raw))) : null
}

// ─── Series ───────────────────────────────────────────────────────────────────

export async function getSeries(): Promise<SeriesDto[]> {
  if (DEMO_MODE) return mock.mockGetSeries()
  const raw = await apiFetch<{ data: backend.BackendSeries[] }>('/series')
  return SeriesListResponseSchema.parse(backend.toSeriesList(raw)).map(adaptSeries)
}

export async function getSeriesById(id: string): Promise<SeriesDto | null> {
  if (DEMO_MODE) return mock.mockGetSeriesById(id)
  const raw = await apiFetchOrNull<backend.BackendSeries>(`/series/${id}`)
  return raw ? adaptSeries(SeriesListResponseSchema.element.parse(backend.toSeries(raw))) : null
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export async function getWalletPositions(address: string): Promise<WalletPositionsDto | null> {
  if (DEMO_MODE) return mock.mockGetWalletPositions(address)
  const raw = await apiFetchOrNull<backend.BackendWallet>('/wallet/positions', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
  return raw ? adaptWalletPositions(WalletPositionsSchema.parse(backend.toWallet(raw))) : null
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth() {
  if (DEMO_MODE) return mock.mockGetHealth()
  const h = await apiFetch<{ status: string; updated_at: string }>('/health')
  return { status: h.status, timestamp: h.updated_at }
}

// ─── Faucet (devnet test tokens) ─────────────────────────────────────────────

export interface FaucetResult {
  signature: string
  tokens: number
  sol: number
}

export class FaucetCooldownError extends Error {
  constructor(public retryAfterSecs: number) {
    super('Faucet cooldown')
  }
}

/** Asks the backend for devnet test tokens (and a little SOL for fees). One drip per address per cooldown. */
export async function postFaucet(address: string): Promise<FaucetResult> {
  if (DEMO_MODE) throw new Error('The faucet needs the live backend; demo mode is on.')
  const res = await fetch(`${API_BASE}/v1/faucet`, { method: 'POST', headers: BASE_HEADERS, body: JSON.stringify({ address }) })
  const json = (await res.json().catch(() => ({}))) as { message?: string; retry_after_secs?: number } & Partial<FaucetResult>
  if (res.status === 429) throw new FaucetCooldownError(json.retry_after_secs ?? 3600)
  if (!res.ok) throw new Error(json.message ?? 'The faucet is unavailable right now.')
  return json as FaucetResult
}

export const isLiveBackend = !DEMO_MODE
