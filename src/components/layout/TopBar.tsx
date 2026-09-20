'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { WalletButton } from '@/components/layout/WalletButton'
import { SearchInput } from '@/components/brand/SearchInput'

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Explorer',
  '/app': 'Explorer',
  '/app/protocols': 'Protocols',
  '/app/vaults': 'Fixed-Term Vaults',
  '/app/wallet': 'My Positions',
  '/app/methodology': 'Risk Methodology',
  '/protocols': 'Protocols',
  '/vaults': 'Fixed-Term Vaults',
  '/wallet': 'My Positions',
  '/methodology': 'Risk Methodology',
}

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [
    { label: 'YieldCompass', href: '/app' },
  ]

  if (pathname === '/' || pathname === '/app') return crumbs

  // Handle dynamic routes
  const segments = pathname.split('/').filter(Boolean)
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    if (path === '/app') continue
    const label = BREADCRUMB_MAP[path] ?? segment.replace(/-/g, ' ')
    crumbs.push({ label, href: path })
  }
  return crumbs
}

interface TopBarProps {
  sidebarWidth?: number
}

export function TopBar({ sidebarWidth = 240 }: TopBarProps) {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)
  const [search, setSearch] = useState('')

  return (
    <header
      className="fixed top-0 right-0 z-20 h-14 bg-[var(--bg-elevated)]/80 backdrop-blur-md border-b border-[var(--border)] left-0 md:left-[var(--sidebar-w,240px)] transition-[left] duration-200"
      data-sidebar-width={sidebarWidth}
    >
      <div className="flex items-center gap-4 px-4 md:px-6 h-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1.5 min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  size={13}
                  className="text-[var(--text-muted)] flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {i === crumbs.length - 1 ? (
                <span className="text-sm font-semibold text-[var(--text)] truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Search using SearchInput */}
        <div className="hidden sm:block w-48 md:w-56">
          <SearchInput
            id="global-search"
            placeholder="Search protocols…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
          />
        </div>

        {/* Devnet badge */}
        <div className="flex items-center gap-2">
          <span
            className="badge badge-amber text-[10.5px] hidden sm:inline-flex"
            title="Connected to Solana Devnet"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
            Devnet
          </span>
          <span className="badge badge-red text-[10px] hidden md:inline-flex" title="Unaudited prototype">
            Unaudited
          </span>
        </div>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  )
}
