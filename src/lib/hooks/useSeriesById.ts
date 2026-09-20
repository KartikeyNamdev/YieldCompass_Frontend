'use client'
import { useQuery } from '@tanstack/react-query'
import { getSeriesById } from '@/lib/api/client'

export function useSeriesById(id: string) {
  return useQuery({
    queryKey: ['series', id],
    queryFn: () => getSeriesById(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}
