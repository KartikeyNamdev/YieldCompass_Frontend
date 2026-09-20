'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FaucetCooldownError, postFaucet } from '@/lib/api/client'
import { formatDuration } from '@/lib/vault/format'

export function useFaucet() {
  const { publicKey } = useWallet()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => {
      if (!publicKey) throw new Error('Connect a wallet first.')
      return postFaucet(publicKey.toBase58())
    },
    onSuccess: (r) => {
      toast.success(`Sent ${r.tokens.toLocaleString('en-US')} test tokens${r.sol > 0 ? ` and ${r.sol} SOL for fees` : ''}.`)
      qc.invalidateQueries({ queryKey: ['token-balance'] })
    },
    onError: (e) => {
      if (e instanceof FaucetCooldownError) toast.error(`You already used the faucet. Try again in ${formatDuration(e.retryAfterSecs)}.`)
      else toast.error(e instanceof Error ? e.message : 'The faucet is unavailable right now.')
    },
  })
}
