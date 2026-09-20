'use client'
import { useQuery } from '@tanstack/react-query'
import { getSeries } from '@/lib/api/client'

export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn: getSeries,
    staleTime: 60 * 1000, // 1 minute
  })
}
