import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { GridBackground } from '@/components/brand/GridBackground'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text)] relative overflow-x-hidden selection:bg-[var(--accent)]/30 selection:text-white">
      {/* Subtle faint grid background with radial vignette */}
      <GridBackground withRadialFade className="min-h-screen">
        {/* Floating pill navigation (no sidebar) */}
        <Navbar />

        {/* Main landing content */}
        <main className="relative z-10 w-full">
          {children}
        </main>
      </GridBackground>
    </div>
  )
}
