'use client'

import React from 'react'

export interface DiagramNode {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  status?: 'active' | 'success' | 'warning' | 'default'
  badge?: string
}

export interface NodeDiagramProps {
  nodes?: DiagramNode[]
  className?: string
  interactive?: boolean
}

const DEFAULT_NODES: DiagramNode[] = [
  {
    id: 'score',
    label: 'Risk Score Engine',
    sub: '7-Factor Deterministic Rules',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    status: 'success',
    badge: 'Score: 88',
  },
  {
    id: 'gate',
    label: 'Automated Risk Gate',
    sub: 'Min 75 Risk + Fresh Data',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    status: 'active',
    badge: 'Gate Passed',
  },
  {
    id: 'vault',
    label: 'Fixed-Term Vault',
    sub: 'Senior Target + First-Loss Buffer',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    status: 'success',
    badge: 'Protected',
  },
]

export function NodeDiagram({
  nodes = DEFAULT_NODES,
  className = '',
}: NodeDiagramProps) {
  return (
    <div className={`relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden ${className}`}>
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, var(--accent-glow) 0%, transparent 70%)',
        }}
      />

      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1

        return (
          <React.Fragment key={node.id}>
            {/* Node Card */}
            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-xl bg-[var(--surface-strong)] border border-[rgba(52,211,153,0.25)] shadow-[0_4px_20px_rgba(0,0,0,0.4)] min-w-[170px] max-w-[210px] w-full transition-transform hover:-translate-y-1">
              {/* Glow badge on top */}
              {node.badge && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)] border border-[rgba(52,211,153,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    {node.badge}
                  </span>
                </div>
              )}

              {/* Node Icon */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(52,211,153,0.18)] to-[rgba(5,8,7,0.8)] border border-[rgba(52,211,153,0.4)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)] mb-2.5">
                {node.icon}
              </div>

              {/* Node Label & Sub */}
              <span className="font-semibold text-xs text-[var(--text)] tracking-tight">
                {node.label}
              </span>
              {node.sub && (
                <span className="text-[10.5px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                  {node.sub}
                </span>
              )}
            </div>

            {/* SVG Connector between nodes */}
            {!isLast && (
              <div className="relative flex-1 flex items-center justify-center w-full md:w-auto h-8 md:h-auto min-w-[36px] my-1 md:my-0">
                {/* Desktop horizontal connector */}
                <svg
                  className="hidden md:block w-full h-8 overflow-visible"
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`node-line-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id={`node-glow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <line
                    x1="0"
                    y1="12"
                    x2="90"
                    y2="12"
                    stroke={`url(#node-line-grad-${index})`}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    filter={`url(#node-glow-${index})`}
                  />
                  {/* Arrowhead */}
                  <polygon
                    points="88,8 98,12 88,16"
                    fill="var(--accent)"
                    filter={`url(#node-glow-${index})`}
                  />
                </svg>

                {/* Mobile vertical connector */}
                <svg
                  className="md:hidden h-8 w-6 overflow-visible"
                  viewBox="0 0 24 32"
                >
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="24"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <polygon
                    points="8,22 12,30 16,22"
                    fill="var(--accent)"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
