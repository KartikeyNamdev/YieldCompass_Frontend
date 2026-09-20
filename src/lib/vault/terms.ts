/**
 * Term sheet and scenario math for a series. Pure functions, no I/O.
 *
 * Semantics match the on-chain program and the mock yield source: a scenario of +600 bps means the
 * strategy ends the term with 6% MORE than was deployed (it is not an annualised rate).
 * Rounding and the waterfall use the same primitives as the tested waterfall package.
 */
import { claimAmount, juniorRatioOk, seniorOwed, waterfallSplit } from '@/lib/waterfall'

export const UNIT = 1_000_000 // 1 test token = 1_000_000 base units
export const BPS = 10_000n

export const SCENARIOS_BPS = [-1000, -500, 0, 200, 600] as const

export type Tranche = 'senior' | 'junior'

export const toUnits = (n: number): bigint => BigInt(Math.round(n * UNIT))
export const fromUnits = (v: bigint): number => Number(v) / UNIT

/** "12.5" -> 12_500_000n. Null for empty, negative, zero, non-numeric or more than 6 decimals. */
export function parseAmount(input: string): bigint | null {
  const m = /^(\d{1,12})(?:\.(\d{1,6}))?$/.exec(input.trim())
  if (!m) return null
  const v = BigInt(m[1]) * BigInt(UNIT) + BigInt((m[2] ?? '').padEnd(6, '0') || '0')
  return v > 0n ? v : null
}

/** Total assets after the strategy moves by `yieldBps` of what was deployed. */
export function applyYield(deployed: bigint, yieldBps: number): bigint {
  const move = (deployed * BigInt(Math.abs(yieldBps))) / BPS
  return yieldBps >= 0 ? deployed + move : deployed - move
}

export interface SeriesFacts {
  seniorPrincipal: bigint
  juniorPrincipal: bigint
  rateBps: number
  termSecs: number
  minJuniorBps: number
}

export function simulateSeries(f: SeriesFacts, yieldBps: number) {
  const totalAssets = applyYield(f.seniorPrincipal + f.juniorPrincipal, yieldBps)
  const owed = seniorOwed(f.seniorPrincipal, BigInt(f.rateBps), BigInt(f.termSecs))
  const { seniorPayout, juniorPayout } = waterfallSplit(totalAssets, owed)
  return {
    totalAssets,
    seniorOwed: owed,
    seniorPayout,
    juniorPayout,
    seniorShortfall: seniorPayout < owed,
    juniorWipedOut: juniorPayout === 0n && f.juniorPrincipal > 0n,
  }
}

export interface Scenario {
  yieldBps: number
  payout: bigint
  profit: bigint
  loss: bigint
}

/** What a NEW deposit of `amount` in `tranche` would look like, including its effect on the tranche totals. */
export function buildTerms(f: SeriesFacts, tranche: Tranche, amount: bigint, yieldBps: readonly number[] = SCENARIOS_BPS) {
  const after: SeriesFacts = {
    ...f,
    seniorPrincipal: f.seniorPrincipal + (tranche === 'senior' ? amount : 0n),
    juniorPrincipal: f.juniorPrincipal + (tranche === 'junior' ? amount : 0n),
  }
  const trancheAfter = tranche === 'senior' ? after.seniorPrincipal : after.juniorPrincipal
  const scenarios: Scenario[] = yieldBps.map((y) => {
    const r = simulateSeries(after, y)
    const pool = tranche === 'senior' ? r.seniorPayout : r.juniorPayout
    const payout = claimAmount(pool, amount, trancheAfter)
    return { yieldBps: y, payout, profit: payout > amount ? payout - amount : 0n, loss: payout < amount ? amount - payout : 0n }
  })

  // Capacity rule: junior >= min_junior_bps of the total. Senior headroom given the CURRENT junior:
  const minBps = BigInt(f.minJuniorBps)
  const maxSenior = (f.juniorPrincipal * (BPS - minBps)) / minBps
  return {
    target: tranche === 'senior' ? seniorOwed(amount, BigInt(f.rateBps), BigInt(f.termSecs)) : null,
    scenarios,
    capacityOk: tranche === 'junior' || juniorRatioOk(after.juniorPrincipal, after.seniorPrincipal, minBps),
    maxAdditionalSenior: maxSenior > f.seniorPrincipal ? maxSenior - f.seniorPrincipal : 0n,
  }
}
