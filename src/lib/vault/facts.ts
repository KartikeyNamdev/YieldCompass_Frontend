import type { SeriesDto } from '@/lib/api/adapters'
import { toUnits, type SeriesFacts } from './terms'

export function factsOf(s: SeriesDto): SeriesFacts {
  return {
    seniorPrincipal: toUnits(s.seniorDepositedUsdc),
    juniorPrincipal: toUnits(s.juniorDepositedUsdc),
    rateBps: s.targetRateBps,
    termSecs: s.termSecs,
    minJuniorBps: s.minJuniorBps,
  }
}

const DATE_OPTS: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
export const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-US', DATE_OPTS)
