/**
 * Browser end-to-end of the vault flow against a running frontend + backend + devnet.
 * A scripted "Test Wallet" is registered through the Wallet Standard; signing happens in Node with a devnet test keypair.
 *
 *   E2E_URL=http://localhost:3100 E2E_SERIES=4 E2E_KEYPAIR=path/to/devnet-test-keypair.json node e2e/vault-flow.mjs
 *
 * Needs an OPEN series whose deposit deadline is still in the future, and the keeper running (it settles the series).
 * DEVNET TEST KEYS ONLY.
 */
import { Keypair, Transaction } from '@solana/web3.js'
import { readFileSync } from 'fs'
import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.E2E_URL ?? 'http://localhost:3100'
const SERIES = process.env.E2E_SERIES
const KEYPAIR = process.env.E2E_KEYPAIR
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!SERIES || !KEYPAIR) throw new Error('set E2E_SERIES and E2E_KEYPAIR')

const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(KEYPAIR, 'utf8'))))
const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const walletScript = (address, pub) => `(() => {
  const account = { address: ${JSON.stringify(address)}, publicKey: Uint8Array.from(${JSON.stringify(pub)}),
    chains: ['solana:devnet', 'solana:mainnet', 'solana:testnet'], features: ['solana:signTransaction'] };
  const wallet = {
    version: '1.0.0', name: 'Test Wallet', icon: ${JSON.stringify(ICON)},
    chains: ['solana:devnet', 'solana:mainnet', 'solana:testnet'], accounts: [account],
    features: {
      'standard:connect': { version: '1.0.0', connect: async () => ({ accounts: [account] }) },
      'standard:disconnect': { version: '1.0.0', disconnect: async () => {} },
      'standard:events': { version: '1.0.0', on: () => () => {} },
      'solana:signTransaction': { version: '1.0.0', supportedTransactionVersions: ['legacy', 0],
        signTransaction: async (...inputs) => {
          const out = []
          for (const i of inputs) out.push({ signedTransaction: Uint8Array.from(await window.__signTx(Array.from(i.transaction))) })
          return out
        } },
    },
  }
  const register = (api) => api.register(wallet)
  window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }))
  window.addEventListener('wallet-standard:app-ready', (e) => register(e.detail))
})()`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 1100 } })
const page = await browser.newPage()
page.on('pageerror', (e) => log(`PAGE ERROR: ${e.message}`))
await page.exposeFunction('__signTx', async (bytes) => {
  const tx = Transaction.from(Buffer.from(bytes))
  tx.partialSign(kp)
  return Array.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false }))
})
// record every toast the app shows (they disappear after a few seconds)
page.on('console', (m) => { if (m.text().startsWith('TOAST:')) log(m.text()) })
await page.evaluateOnNewDocument(`(() => {
  const seen = new Set()
  const scan = () => document.querySelectorAll('[data-sonner-toast]').forEach((n) => {
    const t = n.textContent.trim()
    if (t && !seen.has(t)) { seen.add(t); console.log('TOAST: ' + t) }
  })
  new MutationObserver(scan).observe(document, { childList: true, subtree: true, characterData: true })
})()`)
await page.evaluateOnNewDocument(walletScript(kp.publicKey.toBase58(), Array.from(kp.publicKey.toBytes())))

const text = (t) => `::-p-text(${t})`
const clickText = async (t, timeout = 30_000) => {
  const el = await page.waitForSelector(text(t), { timeout })
  await el.click()
}
// a button is only clickable once React has enabled it (e.g. after the balance has loaded)
const clickEnabled = async (label, timeout = 30_000) => {
  await page.waitForFunction((l) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim().startsWith(l) && !b.disabled), { timeout }, label)
  await clickText(label)
}
const bodyHas = async (t, timeout = 60_000) => {
  try {
    return await page.waitForSelector(text(t), { timeout })
  } catch (e) {
    const toasts = await page.$$eval('[data-sonner-toast]', (n) => n.map((x) => x.textContent)).catch(() => [])
    log(`WAITING FOR "${t}" FAILED. toasts: ${JSON.stringify(toasts)}`)
    await page.screenshot({ path: '/private/tmp/claude-501/e2e-failure.png' })
    throw e
  }
}
// set a React-controlled input the way a user edit would (native setter + input event)
const setAmount = (v) =>
  page.$eval(
    'input[inputmode="decimal"]',
    (el, val) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, val)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    v,
  )
const shot = (n) => page.screenshot({ path: `/private/tmp/claude-501/e2e-${n}.png` })

log(`open series ${SERIES}`)
await page.goto(`${URL_BASE}/app/vaults/${SERIES}`, { waitUntil: 'networkidle2' })
await bodyHas('Term sheet')
await bodyHas('Connect wallet')
log('connect the test wallet through the wallet modal')
await clickText('Connect wallet')
await page.waitForSelector('.wallet-adapter-modal-list')
await clickText('Test Wallet')
await bodyHas('Your test tokens')
await page.waitForSelector('.wallet-adapter-modal', { hidden: true, timeout: 15_000 }) // the fading modal would swallow clicks
log('wallet connected; balance panel visible')

log('faucet button')
await clickText('Get test tokens')
await page.waitForSelector('[data-sonner-toast]', { timeout: 60_000 })
const faucetToast = await page.$eval('[data-sonner-toast]', (n) => n.textContent)
log(`faucet toast: ${faucetToast}`)

log('junior deposit of 20')
await clickText('Junior')
await setAmount('20')
await sleep(300)
await clickEnabled('Deposit as junior')
await bodyHas('Deposit as junior: done', 90_000)
log('junior deposit confirmed')

log('senior deposit of 100')
await clickText('Senior')
await setAmount('100')
await sleep(300)
await clickEnabled('Deposit as senior')
await bodyHas('Deposit as senior: done', 90_000)
log('senior deposit confirmed')
await shot('1-deposited')

log('wait for the deposit window to close, then activate through the risk gate')
await bodyHas('Activate series', 180_000)
await clickEnabled('Activate series')
await bodyHas('Activate series: done', 90_000)
log('series activated')

log('wait for the keeper to settle, then claim')
await bodyHas('Claim senior payout', 240_000)
await shot('2-settled')
await clickEnabled('Claim senior payout')
await bodyHas('Claim senior payout: done', 90_000)
await sleep(2000)
await bodyHas('Claim junior payout', 60_000)
await clickEnabled('Claim junior payout')
await bodyHas('Claim junior payout: done', 90_000)
log('both payouts claimed')

log('positions page shows everything claimed')
await page.goto(`${URL_BASE}/app/wallet`, { waitUntil: 'networkidle2' })
await bodyHas(`Series #${SERIES}`, 60_000)
await shot('3-wallet')
log('E2E PASSED')
await browser.close()
