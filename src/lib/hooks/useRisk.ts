'use client'
import { useQuery } from '@tanstack/react-query'
import { getRisk } from '@/lib/api/client'

export function useRisk(protocolId: string) {
  return useQuery({
    queryKey: ['risk', protocolId],
    queryFn: () => getRisk(protocolId),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!protocolId,
  })
}
