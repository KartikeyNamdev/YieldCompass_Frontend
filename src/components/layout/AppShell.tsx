'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { TickerStrip } from './TickerStrip'
import { MobileBottomBar } from './MobileBottomBar'

const SIDEBAR_WIDTH = 240
const SIDEBAR_COLLAPSED_WIDTH = 60

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const width = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div
      className="min-h-screen bg-[var(--bg-base)] text-[var(--text)]"
      style={{ '--sidebar-w': `${width}px` } as React.CSSProperties}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Top bar */}
      <TopBar sidebarWidth={width} />

      {/* Main content area */}
      <div className="transition-[margin-left] duration-200 ease-out ml-0 md:ml-[var(--sidebar-w,240px)]">
        {/* Header offset (top bar height 56px) */}
        <div className="pt-14">
          {/* Ticker strip */}
          <TickerStrip />
          {/* Page content */}
          <main className="px-4 md:px-6 pb-24 md:pb-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <MobileBottomBar />
    </div>
  )
}
