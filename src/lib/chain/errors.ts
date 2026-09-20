/**
 * Turn wallet / RPC / program failures into one sentence a user can act on.
 * Program errors are matched by their Anchor error code in the transaction logs.
 */
const PROGRAM_ERRORS: Record<string, string> = {
  RiskScoreTooLow: "Refused by the risk gate: the strategy's risk score is below this series' minimum.",
  RiskEntryStale: "Refused by the risk gate: the strategy's on-chain risk score is out of date.",
  JuniorBufferTooSmall: 'Not enough junior capital to back this much senior. Add junior capital first or deposit less.',
  DepositWindowClosed: 'The deposit window for this series has closed.',
  DepositWindowOpen: 'The deposit window is still open on-chain (the network clock can trail yours by a few seconds). Try again shortly.',
  Paused: 'The vault is paused. Deposits and activation are blocked; claims still work.',
  WrongStatus: 'This action is not available in the vault status right now.',
  NotMatured: 'The series has not reached maturity on-chain yet (the network clock can trail yours by a few seconds). Try again shortly.',
  NothingToClaim: 'Nothing to claim for this position.',
  InvalidParams: 'The vault rejected this request. A series with no deposits cannot be activated.',
  Unauthorized: 'This wallet is not allowed to do that.',
  MathOverflow: 'The amount is too large.',
  ActivationConditionsMet: 'This series can still be activated, so it cannot be cancelled.',
}

export function programErrorCode(e: unknown): string | undefined {
  const anyE = e as { logs?: string[]; transactionLogs?: string[]; message?: string }
  const hay = [...(anyE?.logs ?? []), ...(anyE?.transactionLogs ?? []), anyE?.message ?? ''].join('\n')
  return /Error Code: (\w+)/.exec(hay)?.[1]
}

export function explainTxError(e: unknown): string {
  const code = programErrorCode(e)
  if (code && PROGRAM_ERRORS[code]) return PROGRAM_ERRORS[code]
  const msg = (e as Error)?.message ?? String(e)
  if (/reject|denied|cancel/i.test(msg)) return 'Transaction cancelled in your wallet.'
  if (/insufficient funds|0x1\b/i.test(msg)) return 'Not enough test tokens for this amount. Use the faucet to get more.'
  if (/insufficient lamports|debit an account but found no record|AccountNotFound/i.test(msg)) {
    return 'Your wallet needs devnet SOL for fees. The faucet sends a little.'
  }
  if (/blockhash/i.test(msg)) return 'The network was busy. Please try again.'
  return 'The transaction failed. Please try again.'
}
