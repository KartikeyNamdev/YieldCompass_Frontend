import { describe, expect, it } from 'vitest'
import { applyYield, buildTerms, fromUnits, parseAmount, simulateSeries, toUnits, type SeriesFacts } from './terms'
import { formatCountdown, formatDuration, formatUnits } from './format'

const YEAR = 31_536_000
const base = (o: Partial<SeriesFacts> = {}): SeriesFacts => ({
  seniorPrincipal: toUnits(100), juniorPrincipal: toUnits(10), rateBps: 200, termSecs: YEAR, minJuniorBps: 1000, ...o,
})

describe('scenario table (senior 100, junior 10, 2%, 1 year)', () => {
  const rows: Array<[number, number, number]> = [[600, 102, 14.6], [200, 102, 10.2], [0, 102, 8], [-500, 102, 2.5], [-1000, 99, 0]]
  for (const [bps, senior, junior] of rows) {
    it(`${bps} bps`, () => {
      const r = simulateSeries(base(), bps)
      expect(fromUnits(r.seniorPayout)).toBeCloseTo(senior, 6)
      expect(fromUnits(r.juniorPayout)).toBeCloseTo(junior, 6)
    })
  }
  it('a percentage scenario is NOT annualised: it applies to a 3 minute term exactly the same', () => {
    const short = simulateSeries(base({ termSecs: 180 }), 600)
    expect(fromUnits(short.totalAssets)).toBeCloseTo(116.6, 6)
  })
  it('flags shortfall only once junior is wiped out', () => {
    expect(simulateSeries(base(), -500)).toMatchObject({ seniorShortfall: false, juniorWipedOut: false })
    expect(simulateSeries(base(), -1000)).toMatchObject({ seniorShortfall: true, juniorWipedOut: true })
  })
})

describe('buildTerms', () => {
  it('senior deposit of 100 targets 102 after a year', () => {
    const t = buildTerms(base({ seniorPrincipal: 0n, juniorPrincipal: toUnits(100) }), 'senior', toUnits(100))
    expect(fromUnits(t.target!)).toBe(102)
    expect(t.capacityOk).toBe(true)
  })
  it('a depositor gets their pro-rata share of the tranche payout', () => {
    const t = buildTerms(base({ seniorPrincipal: toUnits(100), juniorPrincipal: toUnits(40) }), 'senior', toUnits(100))
    expect(fromUnits(t.scenarios.find((s) => s.yieldBps === 0)!.payout)).toBeCloseTo(102, 6)
    expect(t.scenarios.find((s) => s.yieldBps === -1000)!.loss).toBe(0n)
  })
  it('capacity rule and remaining headroom', () => {
    const f = base({ seniorPrincipal: toUnits(80), juniorPrincipal: toUnits(10) })
    expect(buildTerms(f, 'senior', toUnits(10))).toMatchObject({ capacityOk: true, maxAdditionalSenior: toUnits(10) })
    expect(buildTerms(f, 'senior', toUnits(11)).capacityOk).toBe(false)
    expect(buildTerms(f, 'junior', toUnits(1)).capacityOk).toBe(true)
  })
  it('junior has no fixed target', () => {
    expect(buildTerms(base(), 'junior', toUnits(5)).target).toBeNull()
  })
})

describe('amount parsing', () => {
  it.each([['100', 100_000_000n], ['0.5', 500_000n], ['12.345678', 12_345_678n], [' 7 ', 7_000_000n]])('%s', (s, v) => {
    expect(parseAmount(s)).toBe(v)
  })
  it.each(['', '0', '0.0', '-1', 'abc', '1e6', '1.1234567', '1,5', '99999999999999'])('rejects %j', (s) => {
    expect(parseAmount(s)).toBeNull()
  })
  it('applyYield matches the on-chain rounding (floor of the move)', () => {
    expect(applyYield(3n, 3333)).toBe(3n + 0n)
    expect(applyYield(3n, -3333)).toBe(3n)
    expect(applyYield(1_000_000n, -1000)).toBe(900_000n)
  })
})

describe('format', () => {
  it('units, durations, countdown', () => {
    expect(formatUnits(102_500_000n)).toBe('102.5')
    expect(formatUnits(1n)).toBe('0.000001')
    expect(formatUnits(0n)).toBe('0')
    expect(formatDuration(180)).toBe('3 min')
    expect(formatDuration(7_776_000)).toBe('90 days')
    expect(formatCountdown(65_000)).toBe('1m 5s')
    expect(formatCountdown(-5)).toBe('0s')
  })
})
