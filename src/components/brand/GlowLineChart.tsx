'use client'

import React from 'react'

export interface GlowLineChartProps {
  headlinePoints?: number[]
  realizedPoints?: number[]
  labels?: string[]
  height?: number
  className?: string
  showGapGlow?: boolean
}

// Default 30-day mock yield trend points (matching seed dynamics: Kamino / MarginFi)
const DEFAULT_HEADLINE = [9.4, 9.5, 9.2, 9.6, 9.3, 9.8, 9.5, 9.4, 9.6, 9.3, 9.7, 9.5]
const DEFAULT_REALIZED = [6.2, 6.4, 6.1, 6.3, 6.0, 6.5, 6.3, 6.2, 6.4, 6.1, 6.3, 6.1]
const DEFAULT_LABELS = ['Day 1', 'Day 3', 'Day 6', 'Day 9', 'Day 12', 'Day 15', 'Day 18', 'Day 21', 'Day 24', 'Day 27', 'Day 30']

export function GlowLineChart({
  headlinePoints = DEFAULT_HEADLINE,
  realizedPoints = DEFAULT_REALIZED,
  labels = DEFAULT_LABELS,
  height = 200,
  className = '',
  showGapGlow = true,
}: GlowLineChartProps) {
  const viewBoxWidth = 600
  const viewBoxHeight = height
  const paddingX = 36
  const paddingTop = 28
  const paddingBottom = 32

  const plotWidth = viewBoxWidth - paddingX * 2
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom

  // Compute min/max
  const allValues = [...headlinePoints, ...realizedPoints]
  const minVal = Math.min(...allValues) - 1.0
  const maxVal = Math.max(...allValues) + 1.0

  const getCoordinates = (points: number[]) => {
    const step = plotWidth / (points.length - 1)
    return points.map((val, idx) => {
      const x = paddingX + idx * step
      const normalizedY = (val - minVal) / (maxVal - minVal)
      const y = paddingTop + plotHeight - normalizedY * plotHeight
      return { x, y, val }
    })
  }

  const headlineCoords = getCoordinates(headlinePoints)
  const realizedCoords = getCoordinates(realizedPoints)

  // Build SVG path strings
  const toPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`
      // Smooth curve with cubic beziers
      const prev = arr[idx - 1]
      const cpX1 = prev.x + (curr.x - prev.x) / 2
      const cpY1 = prev.y
      const cpX2 = prev.x + (curr.x - prev.x) / 2
      const cpY2 = curr.y
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`
    }, '')
  }

  const headlinePath = toPath(headlineCoords)
  const realizedPath = toPath(realizedCoords)

  // Build gap polygon (between headline and realized paths)
  const gapPolygonPath = (() => {
    const forward = headlineCoords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ')
    const backward = [...realizedCoords].reverse().map(c => `L ${c.x} ${c.y}`).join(' ')
    return `${forward} ${backward} Z`
  })()

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        className="w-full h-auto overflow-visible"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Emerald glow filter */}
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.13   0 0 0 0 0.77   0 0 0 0 0.37  0 0 0 0.7 0"
              result="glowColor"
            />
            <feMerge>
              <feMergeNode in="glowColor" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Headline amber glow filter */}
          <filter id="headline-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gap gradient */}
          <linearGradient id="gap-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F87171" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.04" />
          </linearGradient>

          {/* Realized line gradient */}
          <linearGradient id="realized-stroke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
        </defs>

        {/* Faint Horizontal Grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const y = paddingTop + plotHeight * ratio
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={viewBoxWidth - paddingX}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )
        })}

        {/* Gap area glow fill */}
        {showGapGlow && (
          <path
            d={gapPolygonPath}
            fill="url(#gap-fill-gradient)"
            className="transition-opacity duration-300"
          />
        )}

        {/* Headline APY Line (Advertised, top line) */}
        <path
          d={headlinePath}
          fill="none"
          stroke="rgba(251, 191, 36, 0.7)"
          strokeWidth="2"
          strokeDasharray="4 4"
          filter="url(#headline-glow)"
        />

        {/* Realized APY Line (Actual, lower line, glowing emerald) */}
        <path
          d={realizedPath}
          fill="none"
          stroke="url(#realized-stroke-grad)"
          strokeWidth="3"
          filter="url(#emerald-glow)"
        />

        {/* Realized line pulse points on first and last */}
        {realizedCoords.length > 0 && (
          <>
            <circle
              cx={realizedCoords[realizedCoords.length - 1].x}
              cy={realizedCoords[realizedCoords.length - 1].y}
              r="4.5"
              fill="#34D399"
              filter="url(#emerald-glow)"
            />
            <circle
              cx={realizedCoords[realizedCoords.length - 1].x}
              cy={realizedCoords[realizedCoords.length - 1].y}
              r="8"
              fill="none"
              stroke="#34D399"
              strokeWidth="1.5"
              opacity="0.4"
            />
          </>
        )}

        {/* X-axis labels */}
        {labels.map((lbl, idx) => {
          const step = plotWidth / (labels.length - 1)
          const x = paddingX + idx * step
          return (
            <text
              key={idx}
              x={x}
              y={viewBoxHeight - 10}
              textAnchor="middle"
              fill="#74827B"
              fontSize="10"
              fontFamily="var(--font-body)"
            >
              {lbl}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
