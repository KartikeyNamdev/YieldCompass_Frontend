'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  Vault,
  Wallet,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  disabled?: boolean
  soon?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { href: '/app', label: 'Explorer', icon: LayoutDashboard },
      { href: '/app/protocols', label: 'Protocols', icon: Shield },
    ],
  },
  {
    label: 'Vaults',
    items: [
      { href: '/app/vaults', label: 'Fixed-Term Vaults', icon: Vault },
      { href: '/app/wallet', label: 'My Positions', icon: Wallet },
    ],
  },
  {
    label: 'Learn',
    items: [
      { href: '/app/methodology', label: 'Risk Methodology', icon: BookOpen },
    ],
  },
  {
    label: 'Coming Soon',
    items: [
      { href: '#', label: 'Alerts', icon: Bell, disabled: true, soon: true },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`sidebar fixed top-0 left-0 h-full z-30 flex flex-col bg-[var(--bg-elevated)] border-r border-[var(--border)] ${collapsed ? 'collapsed' : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_var(--accent-glow)]"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))' }}
        >
          <Zap size={16} className="text-[var(--on-accent)]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-sm text-[var(--text)] block leading-tight">
              YieldCompass
            </span>
            <span className="text-[11px] text-[var(--accent)] font-medium">Devnet</span>
          </div>
        )}
      </Link>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-1.5">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = item.href !== '#' && (
                item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
              )
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${collapsed ? 'justify-center' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : 0}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.soon && (
                    <span className="badge badge-amber text-[9.5px] px-1.5 py-0.5 ml-auto">Soon</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border)] p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
