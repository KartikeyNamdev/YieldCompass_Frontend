/**
 * Transaction builders for the vault. Pure with respect to wallets: they only need a Connection and the user's public key,
 * so they are tested with a plain Keypair signer. The UI signs the returned Transaction with the wallet adapter.
 */
import { BN, Program, type Idl } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Buffer } from 'buffer'
import idl from './idl/yc_vault.json'
import { MOCK_YIELD_PROGRAM_ID, YC_VAULT_PROGRAM_ID } from './config'

export interface SeriesAddresses {
  underlying_mint: string
  senior_mint: string
  junior_mint: string
  vault: string
  strategy_pool: string
  risk_entry: string
}

export type Tranche = 'senior' | 'junior'

const pk = (s: string) => new PublicKey(s)

export function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('config')], YC_VAULT_PROGRAM_ID)[0]
}

/** mock_yield keeps the pool's funds in a PDA token account derived from the pool address. */
export function poolVaultPda(strategyPool: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('pool_vault'), strategyPool.toBuffer()], MOCK_YIELD_PROGRAM_ID)[0]
}

function program(connection: Connection): Program<Idl> {
  // instruction building needs no wallet: a read-only provider is enough
  return new Program(idl as Idl, { connection } as never)
}

async function finish(connection: Connection, tx: Transaction, feePayer: PublicKey): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  tx.feePayer = feePayer
  tx.recentBlockhash = blockhash
  tx.lastValidBlockHeight = lastValidBlockHeight
  return tx
}

export interface SeriesRef {
  seriesPubkey: string
  addresses: SeriesAddresses
}

export async function buildDepositTx(
  connection: Connection,
  user: PublicKey,
  s: SeriesRef,
  tranche: Tranche,
  amountBaseUnits: bigint,
): Promise<Transaction> {
  if (amountBaseUnits <= 0n) throw new RangeError('amount must be positive')
  const shareMint = pk(tranche === 'senior' ? s.addresses.senior_mint : s.addresses.junior_mint)
  const userShares = getAssociatedTokenAddressSync(shareMint, user)
  const p = program(connection)
  const method = tranche === 'senior' ? p.methods.depositSenior : p.methods.depositJunior
  const ix = await method(new BN(amountBaseUnits.toString()))
    .accountsPartial({
      user,
      config: configPda(),
      series: pk(s.seriesPubkey),
      vault: pk(s.addresses.vault),
      shareMint,
      userUnderlying: getAssociatedTokenAddressSync(pk(s.addresses.underlying_mint), user),
      userShares,
    })
    .instruction()
  const tx = new Transaction().add(createAssociatedTokenAccountIdempotentInstruction(user, userShares, user, shareMint), ix)
  return finish(connection, tx, user)
}

export async function buildClaimTx(connection: Connection, user: PublicKey, s: SeriesRef, tranche: Tranche): Promise<Transaction> {
  const shareMint = pk(tranche === 'senior' ? s.addresses.senior_mint : s.addresses.junior_mint)
  const underlying = pk(s.addresses.underlying_mint)
  const userUnderlying = getAssociatedTokenAddressSync(underlying, user)
  const p = program(connection)
  const method = tranche === 'senior' ? p.methods.claimSenior : p.methods.claimJunior
  const ix = await method()
    .accountsPartial({
      user,
      series: pk(s.seriesPubkey),
      vault: pk(s.addresses.vault),
      shareMint,
      userShares: getAssociatedTokenAddressSync(shareMint, user),
      userUnderlying,
    })
    .instruction()
  const tx = new Transaction().add(createAssociatedTokenAccountIdempotentInstruction(user, userUnderlying, user, underlying), ix)
  return finish(connection, tx, user)
}

/** Anyone may activate after the deposit deadline. The program enforces the risk gate. */
export async function buildActivateTx(connection: Connection, caller: PublicKey, s: SeriesRef): Promise<Transaction> {
  const pool = pk(s.addresses.strategy_pool)
  const ix = await program(connection)
    .methods.activate()
    .accountsPartial({
      caller,
      config: configPda(),
      series: pk(s.seriesPubkey),
      riskEntry: pk(s.addresses.risk_entry),
      vault: pk(s.addresses.vault),
      strategyPool: pool,
      poolVault: poolVaultPda(pool),
    })
    .instruction()
  return finish(connection, new Transaction().add(ix), caller)
}

/** Anyone may settle after maturity (the keeper normally does). */
export async function buildSettleTx(connection: Connection, caller: PublicKey, s: SeriesRef): Promise<Transaction> {
  const pool = pk(s.addresses.strategy_pool)
  const ix = await program(connection)
    .methods.settle()
    .accountsPartial({
      caller,
      series: pk(s.seriesPubkey),
      vault: pk(s.addresses.vault),
      strategyPool: pool,
      poolVault: poolVaultPda(pool),
    })
    .instruction()
  return finish(connection, new Transaction().add(ix), caller)
}

export async function getTokenBalance(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<bigint> {
  try {
    const r = await connection.getTokenAccountBalance(getAssociatedTokenAddressSync(mint, owner), 'confirmed')
    return BigInt(r.value.amount)
  } catch {
    return 0n // no token account yet
  }
}

/** Anyone may cancel after the deadline when activation is impossible (bad risk gate, thin junior buffer, no deposits). */
export async function buildCancelTx(connection: Connection, caller: PublicKey, s: SeriesRef): Promise<Transaction> {
  const ix = await program(connection)
    .methods.cancelSeries()
    .accountsPartial({ caller, config: configPda(), series: pk(s.seriesPubkey), riskEntry: pk(s.addresses.risk_entry) })
    .instruction()
  return finish(connection, new Transaction().add(ix), caller)
}

/** Cancelled series only: burns the user's shares of both tranches and returns principal 1:1. */
export async function buildRefundTx(connection: Connection, user: PublicKey, s: SeriesRef): Promise<Transaction> {
  const seniorMint = pk(s.addresses.senior_mint)
  const juniorMint = pk(s.addresses.junior_mint)
  const underlying = pk(s.addresses.underlying_mint)
  const userSenior = getAssociatedTokenAddressSync(seniorMint, user)
  const userJunior = getAssociatedTokenAddressSync(juniorMint, user)
  const userUnderlying = getAssociatedTokenAddressSync(underlying, user)
  const ix = await program(connection)
    .methods.refund()
    .accountsPartial({
      user,
      series: pk(s.seriesPubkey),
      vault: pk(s.addresses.vault),
      seniorMint,
      juniorMint,
      userSenior,
      userJunior,
      userUnderlying,
    })
    .instruction()
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(user, userSenior, user, seniorMint),
    createAssociatedTokenAccountIdempotentInstruction(user, userJunior, user, juniorMint),
    createAssociatedTokenAccountIdempotentInstruction(user, userUnderlying, user, underlying),
    ix,
  )
  return finish(connection, tx, user)
}
