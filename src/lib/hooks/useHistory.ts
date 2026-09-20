'use client'
import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/lib/api/client'

export function useHistory(protocolId: string) {
  return useQuery({
    queryKey: ['history', protocolId],
    queryFn: () => getHistory(protocolId),
    staleTime: 10 * 60 * 1000,
    enabled: !!protocolId,
  })
}
