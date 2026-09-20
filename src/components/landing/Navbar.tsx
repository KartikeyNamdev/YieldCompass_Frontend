'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Menu, X, ArrowUpRight } from 'lucide-react'
import { GlowButton } from '@/components/brand/GlowButton'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#problem', label: 'The Gap' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#vaults', label: 'Vaults' },
    { href: '#risk-score', label: 'Risk score' },
  ]

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-5xl rounded-full bg-[var(--bg-elevated)]/85 backdrop-blur-xl border border-[var(--border)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-all duration-300"
        aria-label="Landing navigation"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-full py-1 px-1.5"
          aria-label="YieldCompass home"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_var(--accent-glow)] transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))' }}
          >
            <Zap size={16} className="text-[var(--on-accent)]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            YieldCompass
          </span>
        </Link>

        {/* Desktop Anchor Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Devnet Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] text-[var(--warning)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
            Devnet
          </div>

          {/* Launch App GlowButton */}
          <GlowButton
            variant="primary"
            size="sm"
            href="/app"
            icon={<ArrowUpRight size={14} className="text-[var(--on-accent)]" />}
            iconPosition="right"
            className="font-semibold"
          >
            Launch App
          </GlowButton>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:hidden flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-sm font-semibold text-[var(--text)]">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-2">
                <span>Environment</span>
                <span className="badge badge-amber text-[10px]">Solana Devnet</span>
              </div>
              <GlowButton
                variant="primary"
                size="md"
                href="/app"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Launch App
              </GlowButton>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
