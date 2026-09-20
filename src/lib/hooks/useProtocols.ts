'use client'
import { useQuery } from '@tanstack/react-query'
import { getPools } from '@/lib/api/client'

export type Profile = 'conservative' | 'balanced' | 'aggressive'

export function useProtocols(profile: Profile = 'balanced') {
  return useQuery({
    queryKey: ['protocols', profile],
    queryFn: () => getPools(profile),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
