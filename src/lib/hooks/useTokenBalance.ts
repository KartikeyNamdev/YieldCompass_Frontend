'use client'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getTokenBalance } from '@/lib/chain/tx'

/** Test-token balance (base units) of the connected wallet. */
export function useTokenBalance(mint: string | undefined) {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  return useQuery({
    queryKey: ['token-balance', publicKey?.toBase58(), mint],
    queryFn: () => getTokenBalance(connection, publicKey!, new PublicKey(mint!)),
    enabled: !!publicKey && !!mint,
    refetchInterval: 10_000,
  })
}
