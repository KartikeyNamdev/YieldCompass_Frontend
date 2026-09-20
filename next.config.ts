import type { NextConfig } from 'next'

// The browser only ever talks to this app: /v1/* is proxied to the backend (BACKEND_URL, server-side only),
// so there is no CORS setup and no mixed-content problem when the backend is behind a tunnel or another host.
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, '')

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    return BACKEND_URL ? [{ source: '/v1/:path*', destination: `${BACKEND_URL}/v1/:path*` }] : []
  },
  async redirects() {
    return [
      { source: '/protocols', destination: '/app/protocols', permanent: false },
      { source: '/protocols/:id', destination: '/app/protocols/:id', permanent: false },
      { source: '/vaults', destination: '/app/vaults', permanent: false },
      { source: '/vaults/:id', destination: '/app/vaults/:id', permanent: false },
      { source: '/wallet', destination: '/app/wallet', permanent: false },
      { source: '/methodology', destination: '/app/methodology', permanent: false },
    ]
  },
}

export default nextConfig
