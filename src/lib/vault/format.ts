export function formatUsdc(n: number, maxDecimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals })
}

/** Token amount from base units with up to `maxDecimals` decimals, trailing zeros trimmed. */
export function formatUnits(v: bigint, maxDecimals = 6): string {
  const s = v.toString().padStart(7, '0')
  const whole = s.slice(0, -6)
  const frac = s.slice(-6).slice(0, maxDecimals).replace(/0+$/, '')
  return frac ? `${Number(whole).toLocaleString('en-US')}.${frac}` : Number(whole).toLocaleString('en-US')
}

export function formatDuration(secs: number): string {
  if (secs < 90) return `${Math.round(secs)} sec`
  if (secs < 5400) return `${Math.round(secs / 60)} min`
  if (secs < 172_800) return `${Math.round(secs / 3600)} hours`
  return `${Math.round(secs / 86_400)} days`
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86_400)
  const h = Math.floor((s % 86_400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export const shortAddress = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`

export const percent = (bps: number) => `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`
