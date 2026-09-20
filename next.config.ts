import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
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
