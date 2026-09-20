import { z } from 'zod'

// ─── Primitives ──────────────────────────────────────────────────────────────

export const PoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  logo_initial: z.string(),
  logo_color: z.string(),
  headline_apy: z.number(),
  realized_apy_7d: z.number(),
  realized_apy_30d: z.number(),
  emissions_share: z.number(),
  tvl_usd: z.number(),
  risk_score: z.number(),
  updated_at: z.string(),
  sparkline_30d: z.array(z.number()),
})
export type Pool = z.infer<typeof PoolSchema>

export const PoolsResponseSchema = z.array(PoolSchema)

// ─── Risk ─────────────────────────────────────────────────────────────────────

export const RiskFactorSchema = z.object({
  weight: z.number(),
  earned: z.number(),
  label: z.string(),
  notes: z.string(),
})

export const RiskResponseSchema = z.object({
  protocol_id: z.string(),
  computed_at: z.string(),
  expires_at: z.string(),
  overall_score: z.number(),
  factors: z.record(RiskFactorSchema),
})
export type RiskResponse = z.infer<typeof RiskResponseSchema>

// ─── AI Explanation ───────────────────────────────────────────────────────────

export const CitationSchema = z.object({
  id: z.number(),
  label: z.string(),
  url: z.string(),
})

export const ExplainResponseSchema = z.object({
  protocol_id: z.string(),
  generated_at: z.string(),
  explanation: z.string(),
  citations: z.array(CitationSchema),
})
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>

// ─── History ──────────────────────────────────────────────────────────────────

export const HistoryWindowSchema = z.object({
  headline: z.array(z.number()),
  realized: z.array(z.number()),
  dates: z.array(z.string()),
})

export const HistoryResponseSchema = z.object({
  '7d': HistoryWindowSchema,
  '30d': HistoryWindowSchema,
})
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>

// ─── Series / Vaults ─────────────────────────────────────────────────────────

export const SeriesStatusSchema = z.enum(['open', 'active', 'settled', 'cancelled'])
export type SeriesStatus = z.infer<typeof SeriesStatusSchema>

export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: SeriesStatusSchema,
  target_rate_bps: z.number(),
  term_days: z.number(),
  term_secs: z.number(),
  min_junior_bps: z.number(),
  min_risk_score: z.number(),
  deposit_deadline: z.string(),
  maturity_date: z.string(),
  senior_capacity_usdc: z.number(),
  junior_capacity_usdc: z.number(),
  senior_deposited_usdc: z.number(),
  junior_deposited_usdc: z.number(),
  underlying_protocol_id: z.string(),
  risk_score: z.number(),
  risk_score_expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  settled_at: z.string().optional(),
  realized_apy_bps: z.number().optional(),
})
export type Series = z.infer<typeof SeriesSchema>

export const SeriesListResponseSchema = z.array(SeriesSchema)

// ─── Wallet / Positions ───────────────────────────────────────────────────────

export const PoolPositionSchema = z.object({
  protocol_id: z.string(),
  protocol_name: z.string(),
  amount_usdc: z.number(),
  headline_apy: z.number(),
  realized_apy_30d: z.number(),
  entry_date: z.string(),
})

export const VaultPositionSchema = z.object({
  series_id: z.string(),
  series_name: z.string(),
  tranche: z.enum(['senior', 'junior']),
  principal_usdc: z.number(),
  status: SeriesStatusSchema,
  claimable_usdc: z.number(),
})

export const WalletPositionsSchema = z.object({
  address: z.string(),
  pool_positions: z.array(PoolPositionSchema),
  vault_positions: z.array(VaultPositionSchema),
})
export type WalletPositions = z.infer<typeof WalletPositionsSchema>

// ─── Health ───────────────────────────────────────────────────────────────────

export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
})
