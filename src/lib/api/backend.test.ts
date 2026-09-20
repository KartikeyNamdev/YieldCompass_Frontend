import { describe, expect, it } from 'vitest'
import {
  PoolsResponseSchema, RiskResponseSchema, ExplainResponseSchema, HistoryResponseSchema,
  SeriesListResponseSchema, WalletPositionsSchema,
} from './schemas'
import { toExplain, toHistory, toPool, toPools, toRisk, toSeriesList, toWallet } from './backend'
import { adaptSeries } from './adapters'
import pools from './__fixtures__/pools.json'
import pool from './__fixtures__/pool.json'
import risk from './__fixtures__/risk.json'
import explain from './__fixtures__/explain.json'
import h7 from './__fixtures__/h7.json'
import h30 from './__fixtures__/h30.json'
import series from './__fixtures__/series.json'
import wallet from './__fixtures__/wallet.json'

// The fixtures are real responses captured from the running backend.

describe('backend -> UI translation (real API responses)', () => {
  it('pools satisfy the UI schema and use percent units', () => {
    const out = PoolsResponseSchema.parse(toPools(pools as never))
    const p = out.find((x) => x.id === 'aurora-lend')!
    expect(p.headline_apy).toBeCloseTo(8.1, 6)
    expect(p.realized_apy_30d).toBeCloseTo(5.9, 3)
    expect(p.emissions_share).toBe(23)
    expect(p.sparkline_30d.length).toBeGreaterThan(20)
    expect(p.logo_initial).toBe('A')
    expect(p.category).toBe('Lending')
  })

  it('single pool detail parses too', () => {
    expect(PoolsResponseSchema.element.parse(toPool(pool as never)).id).toBe('aurora-lend')
  })

  it('risk keeps all seven factors and the 24h expiry', () => {
    const out = RiskResponseSchema.parse(toRisk(risk as never))
    expect(Object.keys(out.factors)).toHaveLength(7)
    expect(out.overall_score).toBe(86)
    const total = Object.values(out.factors).reduce((a, f) => a + f.earned, 0)
    expect(Math.abs(total - out.overall_score)).toBeLessThanOrEqual(1)
    expect(new Date(out.expires_at).getTime() - new Date(out.computed_at).getTime()).toBe(24 * 3600 * 1000)
  })

  it('explanation carries numbered citations with urls', () => {
    const out = ExplainResponseSchema.parse(toExplain(explain as never))
    expect(out.citations.length).toBeGreaterThan(0)
    expect(out.citations[0]).toMatchObject({ id: 1 })
    expect(out.citations.every((c) => c.url.startsWith('https://'))).toBe(true)
  })

  it('history has aligned headline, realized and dates in percent', () => {
    const out = HistoryResponseSchema.parse(toHistory(h7 as never, h30 as never))
    for (const w of ['7d', '30d'] as const) {
      expect(out[w].headline.length).toBe(out[w].dates.length)
      expect(out[w].realized.length).toBe(out[w].dates.length)
    }
    expect(out['7d'].dates.length).toBeLessThan(out['30d'].dates.length)
    expect(out['30d'].headline.at(-1)).toBeCloseTo(8.1, 6)
    expect(out['30d'].realized.at(-1)).toBeCloseTo(5.9, 2)
  })

  it('series satisfy the schema and the derived risk gate is computed', () => {
    const out = SeriesListResponseSchema.parse(toSeriesList(series as never))
    expect(out.length).toBeGreaterThan(0)
    const settled = out.find((s) => s.status === 'settled')
    if (settled) {
      expect(settled.senior_deposited_usdc).toBe(100)
      expect(settled.junior_deposited_usdc).toBe(20)
      expect(settled.realized_apy_bps).toBe(600) // 6% period return on a short demo term
      expect(adaptSeries(settled).targetRatePct).toBe(2)
    }
  })

  it('wallet positions map amounts and drop unsupported external positions', () => {
    const out = WalletPositionsSchema.parse(toWallet(wallet as never))
    expect(out.pool_positions).toEqual([])
    expect(out.vault_positions.length).toBeGreaterThan(0)
    expect(out.vault_positions.every((v) => typeof v.claimable_usdc === 'number')).toBe(true)
  })
})
