'use client'
import { useQuery } from '@tanstack/react-query'
import { getSeries } from '@/lib/api/client'

export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn: getSeries,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000, // countdowns and tranche fill follow the chain (via the indexer)
  })
}
