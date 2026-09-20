'use client'
import { useQuery } from '@tanstack/react-query'
import { getWalletPositions } from '@/lib/api/client'

export function useWalletPositions(address: string | null) {
  return useQuery({
    queryKey: ['wallet-positions', address],
    queryFn: () => getWalletPositions(address!),
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
    enabled: !!address,
  })
}
