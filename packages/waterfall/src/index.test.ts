import { describe, it, expect } from 'vitest'
import { seniorOwed, waterfallSplit, simulateScenario, juniorRatioOk } from './index'

/**
 * Waterfall math test suite.
 *
 * Spec values: senior=100 USDC, junior=10 USDC, rate=2%, term=1 year
 * All amounts in µUSDC (1 USDC = 1_000_000)
 *
 * Expected results (from spec):
 * +6%  -> total 116.60 -> senior 102.00, junior 14.60
 * +2%  -> total 112.20 -> senior 102.00, junior 10.20    (note: 110 + 2% yield = 112.20)
 * 0%   -> total 110.00 -> senior 102.00, junior 8.00
 * -5%  -> total 104.50 -> senior 102.00, junior 2.50
 * -10% -> total 99.00  -> senior 99.00,  junior 0.00
 */

const USDC = 1_000_000n  // 1 USDC in µUSDC
const SECS_1_YEAR = 31_536_000n
const RATE_2PCT_BPS = 200n  // 2% = 200 bps

const SENIOR = 100n * USDC   // 100 USDC
const JUNIOR = 10n * USDC    // 10 USDC

// Helper: convert µUSDC to display string with 2 decimals
function toUSDC(amount: bigint): string {
  const whole = amount / USDC
  const frac = amount % USDC
  // pad fraction to 6 digits, then take first 2
  const fracStr = frac.toString().padStart(6, '0').slice(0, 2)
  return `${whole}.${fracStr}`
}

describe('seniorOwed', () => {
  it('computes 2% interest over 1 year on 100 USDC = 102 USDC', () => {
    const owed = seniorOwed(SENIOR, RATE_2PCT_BPS, SECS_1_YEAR)
    expect(owed).toBe(102n * USDC)
  })
})

describe('waterfallSplit', () => {
  it('senior gets full owed when total > owed', () => {
    const { seniorPayout, juniorPayout } = waterfallSplit(116_600_000n, 102n * USDC)
    expect(seniorPayout).toBe(102n * USDC)
    expect(juniorPayout).toBe(14_600_000n)
  })

  it('senior gets all when total < owed (loss scenario)', () => {
    const { seniorPayout, juniorPayout } = waterfallSplit(99n * USDC, 102n * USDC)
    expect(seniorPayout).toBe(99n * USDC)
    expect(juniorPayout).toBe(0n)
  })
})

/**
 * Spec table: The underlying yield applies to TOTAL principal (110 USDC) over 1 year.
 * total_assets = 110 + 110 * yieldBps * 31536000 / (10000 * 31536000)
 *             = 110 + 110 * yieldBps / 10000
 *             = 110 * (1 + yieldBps/10000)
 *
 * +6%:  110 * 1.06 = 116.60 ✓
 * +2%:  110 * 1.02 = 112.20 ✓
 *  0%:  110 * 1.00 = 110.00 ✓
 * -5%:  110 * 0.95 = 104.50 ✓
 * -10%: 110 * 0.90 =  99.00 ✓
 */
describe('simulateScenario spec table', () => {
  const cases = [
    {
      yieldBps: 600n,
      expectedTotal: 116_600_000n,
      expectedSenior: 102_000_000n,
      expectedJunior: 14_600_000n,
      label: '+6%',
    },
    {
      yieldBps: 200n,
      expectedTotal: 112_200_000n,
      expectedSenior: 102_000_000n,
      expectedJunior: 10_200_000n,
      label: '+2%',
    },
    {
      yieldBps: 0n,
      expectedTotal: 110_000_000n,
      expectedSenior: 102_000_000n,
      expectedJunior: 8_000_000n,
      label: '0%',
    },
    {
      yieldBps: -500n,
      expectedTotal: 104_500_000n,
      expectedSenior: 102_000_000n,
      expectedJunior: 2_500_000n,
      label: '-5%',
    },
    {
      yieldBps: -1000n,
      expectedTotal: 99_000_000n,
      expectedSenior: 99_000_000n,
      expectedJunior: 0n,
      label: '-10%',
    },
  ] as const

  for (const tc of cases) {
    it(`${tc.label}: total ${toUSDC(tc.expectedTotal)}, senior ${toUSDC(tc.expectedSenior)}, junior ${toUSDC(tc.expectedJunior)}`, () => {
      const result = simulateScenario(
        SENIOR,
        JUNIOR,
        RATE_2PCT_BPS,
        SECS_1_YEAR,
        tc.yieldBps
      )

      expect(result.totalAssets).toBe(tc.expectedTotal)
      expect(result.seniorPayout).toBe(tc.expectedSenior)
      expect(result.juniorPayout).toBe(tc.expectedJunior)
    })
  }
})

describe('juniorRatioOk', () => {
  it('passes when junior meets minimum buffer', () => {
    // 10 junior / 110 total = 9.09% > min 5%
    expect(juniorRatioOk(JUNIOR, SENIOR, 500n)).toBe(true)
  })

  it('fails when junior is below minimum buffer', () => {
    // junior = 1 USDC, senior = 109 USDC, min = 10% (1000 bps)
    // 1 / 110 = 0.9% < 10%
    expect(juniorRatioOk(1n * USDC, 109n * USDC, 1000n)).toBe(false)
  })
})

