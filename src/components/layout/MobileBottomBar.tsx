'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Vault,
  Wallet,
  BookOpen,
} from 'lucide-react'

const TABS = [
  { href: '/app', label: 'Explorer', icon: LayoutDashboard },
  { href: '/app/vaults', label: 'Vaults', icon: Vault },
  { href: '/app/wallet', label: 'Wallet', icon: Wallet },
  { href: '/app/methodology', label: 'Learn', icon: BookOpen },
]

export function MobileBottomBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-elevated)]/90 backdrop-blur-md border-t border-[var(--border)] flex md:hidden"
      aria-label="Mobile navigation"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10.5px] font-medium transition-colors ${
              isActive ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
