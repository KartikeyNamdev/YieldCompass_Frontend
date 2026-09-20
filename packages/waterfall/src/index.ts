/**
 * @yieldcompass/waterfall
 *
 * Pure integer arithmetic waterfall module (BigInt, no float drift).
 * Mirrors the on-chain Rust program logic exactly.
 *
 * All principal/amount values are in lamport-equivalent smallest units (e.g. µUSDC = 1e6).
 * Rate is in basis points (bps). 10_000 bps = 100%.
 * Term is in seconds.
 */

const SECS_PER_YEAR = 31_536_000n
const BPS_DENOMINATOR = 10_000n

/**
 * Compute how much the senior tranche is owed at maturity.
 *
 * senior_owed = principal + principal * rate_bps * term_secs / (10_000 * 31_536_000)
 *
 * Uses integer division (truncating), matching Rust's integer math.
 */
export function seniorOwed(
  principal: bigint,
  rateBps: bigint,
  termSecs: bigint
): bigint {
  const interest = (principal * rateBps * termSecs) / (BPS_DENOMINATOR * SECS_PER_YEAR)
  return principal + interest
}

/**
 * Waterfall split: senior gets paid first, junior gets the remainder.
 *
 * senior_payout = min(total_assets, senior_owed)
 * junior_payout = total_assets - senior_payout
 */
export function waterfallSplit(
  totalAssets: bigint,
  seniorOwedAmount: bigint
): { seniorPayout: bigint; juniorPayout: bigint } {
  const seniorPayout = totalAssets < seniorOwedAmount ? totalAssets : seniorOwedAmount
  const juniorPayout = totalAssets - seniorPayout
  return { seniorPayout, juniorPayout }
}

/**
 * Calculate a user's claim amount based on their share of the pool.
 *
 * claim_amount = floor(payout_total * user_shares / total_shares)
 */
export function claimAmount(
  payoutTotal: bigint,
  userShares: bigint,
  totalShares: bigint
): bigint {
  if (totalShares === 0n) return 0n
  return (payoutTotal * userShares) / totalShares
}

/**
 * Check if the junior buffer meets the minimum required ratio.
 *
 * junior_ratio_ok = junior * 10_000 >= (senior + junior) * min_junior_bps
 */
export function juniorRatioOk(
  junior: bigint,
  senior: bigint,
  minJuniorBps: bigint
): boolean {
  return junior * BPS_DENOMINATOR >= (senior + junior) * minJuniorBps
}

/**
 * High-level scenario simulation.
 *
 * @param seniorPrincipal - Senior principal in µUSDC (1 USDC = 1_000_000n)
 * @param juniorPrincipal - Junior principal in µUSDC
 * @param rateBps         - Senior target rate in bps (200 = 2%)
 * @param termSecs        - Term in seconds
 * @param yieldBps        - Underlying yield scenario in bps (can be negative)
 * @returns Detailed payout breakdown
 */
export function simulateScenario(
  seniorPrincipal: bigint,
  juniorPrincipal: bigint,
  rateBps: bigint,
  termSecs: bigint,
  yieldBps: bigint
): {
  seniorOwed: bigint
  seniorPayout: bigint
  juniorPayout: bigint
  totalAssets: bigint
  seniorProtected: boolean
} {
  const totalPrincipal = seniorPrincipal + juniorPrincipal

  // Total assets = principal + yield earned on total principal
  // yield can be negative (loss scenario)
  let totalAssets: bigint
  if (yieldBps >= 0n) {
    totalAssets =
      totalPrincipal + (totalPrincipal * yieldBps * termSecs) / (BPS_DENOMINATOR * SECS_PER_YEAR)
  } else {
    const loss = (totalPrincipal * (-yieldBps) * termSecs) / (BPS_DENOMINATOR * SECS_PER_YEAR)
    totalAssets = totalPrincipal > loss ? totalPrincipal - loss : 0n
  }

  const seniorOwedAmount = seniorOwed(seniorPrincipal, rateBps, termSecs)
  const { seniorPayout, juniorPayout } = waterfallSplit(totalAssets, seniorOwedAmount)

  return {
    seniorOwed: seniorOwedAmount,
    seniorPayout,
    juniorPayout,
    totalAssets,
    seniorProtected: seniorPayout === seniorOwedAmount,
  }
}
