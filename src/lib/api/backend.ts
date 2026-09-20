/**
 * backend.ts
 *
 * Translates the real YieldCompass API (`/v1`, decimal-fraction rates, string token amounts) into the shapes the
 * UI schemas expect (percent numbers, plain numbers). Everything in here is a pure function so it can be tested
 * against captured API responses (see __fixtures__).
 *
 * Units: the API returns 0.081 for 8.1%. The UI works in percent, so rates are multiplied by 100 here.
 */

import type { ExplainResponse, HistoryResponse, Pool, RiskResponse, Series, WalletPositions } from './schemas'

const PALETTE = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1']

/** fraction -> percent, rounded to 2 decimals (0.0815 -> 8.15) */
const pct = (v: number | null | undefined): number => (v === null || v === undefined ? 0 : Math.round(v * 10_000) / 100)

function hashIndex(s: string, mod: number): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % mod
}

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

// ─── Pools ────────────────────────────────────────────────────────────────────

export interface BackendPool {
  id: string
  name: string
  category: string
  headline_apy: number | null
  realized_apy_7d: number | null
  realized_apy_30d: number | null
  emissions_share: number | null
  tvl_usd: number
  risk_score: number | null
  sparkline_30d?: number[]
  updated_at: string
}

export function toPool(p: BackendPool): Pool {
  const headline = pct(p.headline_apy)
  const spark = (p.sparkline_30d ?? []).map(pct)
  return {
    id: p.id,
    name: p.name,
    category: titleCase(p.category),
    logo_initial: (p.name.trim()[0] ?? '?').toUpperCase(),
    logo_color: PALETTE[hashIndex(p.id, PALETTE.length)],
    headline_apy: headline,
    realized_apy_7d: pct(p.realized_apy_7d),
    realized_apy_30d: pct(p.realized_apy_30d),
    emissions_share: Math.round(pct(p.emissions_share)), // the UI prints this as a whole percent
    tvl_usd: p.tvl_usd,
    risk_score: p.risk_score ?? 0,
    updated_at: p.updated_at,
    sparkline_30d: spark.length > 0 ? spark : [headline],
  }
}

export function toPools(raw: { data: BackendPool[] }): Pool[] {
  return raw.data.map(toPool)
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export interface BackendRisk {
  protocol_id: string
  score: number
  computed_at: string
  breakdown: Array<{ factor: string; label: string; weight: number; points: number; reason: string }>
}

/** On-chain risk entries expire 24h after they are published; the UI shows the same horizon. */
const RISK_TTL_MS = 24 * 3600 * 1000

export function toRisk(r: BackendRisk): RiskResponse {
  return {
    protocol_id: r.protocol_id,
    computed_at: r.computed_at,
    expires_at: new Date(new Date(r.computed_at).getTime() + RISK_TTL_MS).toISOString(),
    overall_score: r.score,
    factors: Object.fromEntries(
      r.breakdown.map((f) => [f.factor, { weight: f.weight, earned: f.points, label: f.label, notes: f.reason }]),
    ),
  }
}

// ─── Explanation ──────────────────────────────────────────────────────────────

export interface BackendExplain {
  protocol_id: string
  explanation: string
  computed_at: string
  sources: Array<{ url: string | null; quote: string | null }>
}

function sourceLabel(s: { url: string | null; quote: string | null }): string {
  if (s.quote) return s.quote.length > 70 ? `${s.quote.slice(0, 67)}...` : s.quote
  try {
    return s.url ? new URL(s.url).hostname : 'Source'
  } catch {
    return 'Source'
  }
}

export function toExplain(e: BackendExplain): ExplainResponse {
  return {
    protocol_id: e.protocol_id,
    generated_at: e.computed_at,
    explanation: e.explanation,
    citations: e.sources.map((s, i) => ({ id: i + 1, label: sourceLabel(s), url: s.url ?? '' })),
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface BackendHistory {
  points: Array<{ ts: string; apy_headline: number | null; realized_apy: number | null }>
}

function toWindow(h: BackendHistory) {
  return {
    headline: h.points.map((p) => pct(p.apy_headline)),
    realized: h.points.map((p) => pct(p.realized_apy)),
    dates: h.points.map((p) => p.ts.slice(0, 10)),
  }
}

export function toHistory(h7: BackendHistory, h30: BackendHistory): HistoryResponse {
  return { '7d': toWindow(h7), '30d': toWindow(h30) }
}

// ─── Series ───────────────────────────────────────────────────────────────────

export interface BackendSeries {
  id: string
  pubkey: string
  addresses: NonNullable<Series['addresses']>
  status: 'open' | 'active' | 'settled' | 'cancelled'
  rate_bps: number
  term_secs: number
  deposit_deadline: string | null
  maturity_ts: string | null
  senior_principal: string
  junior_principal: string
  senior_capacity: string
  junior_needed: string
  min_junior_bps: number
  min_risk_score: number
  protocol_id: string | null
  risk_score: number | null
  risk_expires_at: string | null
  senior_payout: string | null
  junior_payout: string | null
  realized_period_return: number | null
  realized_apy: number | null
  settled_at: string | null
  created_at: string
  updated_at: string
}

export function toSeries(s: BackendSeries): Series {
  const senior = Number(s.senior_principal)
  const junior = Number(s.junior_principal)
  const deadline = s.deposit_deadline ?? s.created_at
  const maturity = s.maturity_ts ?? new Date(new Date(deadline).getTime() + s.term_secs * 1000).toISOString()
  const realized = s.realized_apy ?? s.realized_period_return
  return {
    id: s.id,
    name: `Series #${s.id}`,
    status: s.status,
    target_rate_bps: s.rate_bps,
    term_days: s.term_secs / 86_400,
    term_secs: s.term_secs,
    min_junior_bps: s.min_junior_bps,
    min_risk_score: s.min_risk_score,
    deposit_deadline: deadline,
    maturity_date: maturity,
    // capacity is not a fixed cap on-chain: it is what the junior buffer currently allows (and vice versa)
    senior_capacity_usdc: Math.max(Number(s.senior_capacity), senior),
    junior_capacity_usdc: Math.max(Number(s.junior_needed), junior),
    senior_deposited_usdc: senior,
    junior_deposited_usdc: junior,
    underlying_protocol_id: s.protocol_id ?? 'unknown',
    risk_score: s.risk_score ?? 0,
    risk_score_expires_at: s.risk_expires_at ?? new Date(0).toISOString(),
    created_at: s.created_at,
    updated_at: s.updated_at,
    pubkey: s.pubkey,
    addresses: s.addresses,
    ...(s.senior_payout !== null && s.junior_payout !== null
      ? { senior_payout_usdc: Number(s.senior_payout), junior_payout_usdc: Number(s.junior_payout) }
      : {}),
    ...(s.settled_at ? { settled_at: s.settled_at } : {}),
    ...(s.status === 'settled' && realized !== null ? { realized_apy_bps: Math.round(realized * 10_000) } : {}),
  }
}

export function toSeriesList(raw: { data: BackendSeries[] }): Series[] {
  return raw.data.map(toSeries)
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface BackendWallet {
  address: string
  positions: Array<{
    series_id: string
    tranche: 'senior' | 'junior'
    status: 'open' | 'active' | 'settled' | 'cancelled'
    principal: string
    claimable: string
  }>
}

export function toWallet(w: BackendWallet): WalletPositions {
  return {
    address: w.address,
    // positions in external protocols are not read by the backend yet
    pool_positions: [],
    vault_positions: w.positions.map((p) => ({
      series_id: p.series_id,
      series_name: `Series #${p.series_id}`,
      tranche: p.tranche,
      principal_usdc: Number(p.principal),
      status: p.status,
      claimable_usdc: Number(p.claimable),
    })),
  }
}
