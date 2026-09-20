/**
 * Runs the UI's transaction builders against the DEPLOYED devnet programs with a plain Keypair signer.
 *   TEST_RPC_URL=... TEST_API_URL=http://localhost:4000 TEST_SERIES_ID=3 TEST_USER_KEYPAIR=path/to/keypair.json npm test
 * The series must be open with a deposit deadline in the near future; the keeper must be running to settle it.
 * Skipped otherwise.
 */
import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { buildActivateTx, buildClaimTx, buildDepositTx, getTokenBalance, type SeriesRef } from './tx'
import { PublicKey } from '@solana/web3.js'

const { TEST_RPC_URL, TEST_API_URL, TEST_SERIES_ID, TEST_USER_KEYPAIR } = process.env
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe.skipIf(!TEST_RPC_URL || !TEST_API_URL || !TEST_SERIES_ID || !TEST_USER_KEYPAIR)('devnet: deposit, activate, claim', () => {
  it('drives a whole series with the same transactions the UI sends', async () => {
    const conn = new Connection(TEST_RPC_URL!, 'confirmed')
    const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(TEST_USER_KEYPAIR!, 'utf8'))))
    const get = async () => (await fetch(`${TEST_API_URL}/v1/series/${TEST_SERIES_ID}`)).json()
    const send = (tx: Awaited<ReturnType<typeof buildDepositTx>>) => sendAndConfirmTransaction(conn, tx, [user], { commitment: 'confirmed' })

    let s = await get()
    expect(s.status).toBe('open')
    const ref: SeriesRef = { seriesPubkey: s.pubkey, addresses: s.addresses }
    const mint = new PublicKey(s.addresses.underlying_mint)
    const before = await getTokenBalance(conn, user.publicKey, mint)
    expect(before).toBeGreaterThanOrEqual(120_000_000n) // needs 120 test tokens (faucet)

    await send(await buildDepositTx(conn, user.publicKey, ref, 'junior', 20_000_000n))
    await send(await buildDepositTx(conn, user.publicKey, ref, 'senior', 100_000_000n))
    expect(await getTokenBalance(conn, user.publicKey, mint)).toBe(before - 120_000_000n)

    // wait for the deposit window to close, then activate: the program enforces the risk gate
    const deadline = new Date(s.deposit_deadline).getTime()
    while (Date.now() < deadline + 3000) await sleep(1000)
    await send(await buildActivateTx(conn, user.publicKey, ref))

    // keeper settles after maturity (poll the API, which follows the indexer)
    for (let i = 0; i < 40; i++) {
      s = await get()
      if (s.status === 'settled') break
      await sleep(5000)
    }
    expect(s.status).toBe('settled')

    const beforeClaim = await getTokenBalance(conn, user.publicKey, mint)
    await send(await buildClaimTx(conn, user.publicKey, ref, 'senior'))
    await send(await buildClaimTx(conn, user.publicKey, ref, 'junior'))
    const got = (await getTokenBalance(conn, user.publicKey, mint)) - beforeClaim
    const expected = BigInt(Math.round((Number(s.senior_payout) + Number(s.junior_payout)) * 1e6))
    expect(got).toBe(expected)
    expect(got).toBeGreaterThan(119_000_000n) // no simulated yield: about the principal back, less nothing
  }, 300_000)
})
