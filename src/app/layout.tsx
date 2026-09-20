import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'YieldCompass — Realized Yield, Not Headline Yield',
    template: '%s | YieldCompass',
  },
  description:
    'YieldCompass ranks Solana stablecoin yield by what pools really earned, scores their risk with cited sources, and offers a fixed-term vault with a target rate backed by a first-loss buffer.',
  keywords: ['Solana', 'DeFi', 'yield', 'realized yield', 'APY', 'stablecoin', 'fixed-term vault', 'risk score'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[var(--bg-base)] text-[var(--text)] antialiased min-h-screen">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'var(--surface-strong)',
                color: 'var(--text)',
                borderRadius: '12px',
                border: '1px solid var(--border-strong)',
                fontSize: '13.5px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
