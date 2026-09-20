'use client'
import { useQuery } from '@tanstack/react-query'
import { getPool } from '@/lib/api/client'

export function useProtocol(id: string) {
  return useQuery({
    queryKey: ['protocol', id],
    queryFn: () => getPool(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}
