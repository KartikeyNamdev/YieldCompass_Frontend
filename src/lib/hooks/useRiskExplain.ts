'use client'
import { useQuery } from '@tanstack/react-query'
import { postExplain } from '@/lib/api/client'

export function useRiskExplain(protocolId: string) {
  return useQuery({
    queryKey: ['risk-explain', protocolId],
    queryFn: () => postExplain(protocolId),
    staleTime: 60 * 60 * 1000,
    enabled: !!protocolId,
  })
}
