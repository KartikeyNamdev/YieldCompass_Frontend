'use client'

import React from 'react'

const TECH_CHIPS = [
  'Next.js',
  'Solana + Anchor',
  'FastAPI',
  'Redis',
  'Postgres',
  'Fable 5.1',
]

export function BuiltWithSection() {
  return (
    <section className="py-14 border-t border-[var(--border)] bg-[var(--bg-elevated)]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Hackathon Badge */}
        <div className="mb-4 inline-flex">
          <span className="badge badge-indigo text-[11px] font-semibold px-3 py-1">
            Built for Fable 5.1 Build Day
          </span>
        </div>

        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
          Core Technology Stack
        </p>

        {/* Text-only chips without logos */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {TECH_CHIPS.map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:border-[var(--border-strong)] transition-colors select-none"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
