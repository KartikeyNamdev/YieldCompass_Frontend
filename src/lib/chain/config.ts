import { PublicKey } from '@solana/web3.js'

/** Devnet only. Override the RPC with a private endpoint (e.g. Helius) to avoid public rate limits. */
export const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
export const CLUSTER = 'devnet' as const

export const YC_VAULT_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_YC_VAULT_PROGRAM_ID ?? 'HoLewEAiPuRaJGJXfS4W6uuVRSeeAxC76VGxx3N4YNSW',
)
export const MOCK_YIELD_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_MOCK_YIELD_PROGRAM_ID ?? '13uN3ZYV2puWDXKCLYgxA5ZSYYnBky4cGnuvQDdmpW4B',
)

/** Test stablecoin decimals (1 token = 1_000_000 base units). */
export const TOKEN_DECIMALS = 6

export const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=${CLUSTER}`
export const explorerAddress = (a: string) => `https://explorer.solana.com/address/${a}?cluster=${CLUSTER}`
