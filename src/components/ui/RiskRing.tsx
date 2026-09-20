'use client'

interface RiskRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

function getRiskColor(score: number): string {
  if (score >= 80) return 'var(--color-positive)'
  if (score >= 60) return 'var(--color-warning)'
  return 'var(--color-negative)'
}

function getRiskLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Medium'
  return 'Low'
}

export function RiskRing({
  score,
  size = 44,
  strokeWidth = 4,
  showLabel = false,
}: RiskRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillRatio = Math.min(Math.max(score, 0), 100) / 100
  const dashOffset = circumference * (1 - fillRatio)
  const color = getRiskColor(score)
  const center = size / 2

  return (
    <div
      className="relative inline-flex flex-col items-center gap-1"
      role="img"
      aria-label={`Risk score: ${score} out of 100 (${getRiskLabel(score)} safety)`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="risk-ring-svg"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            className="risk-ring-track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            className="risk-ring-progress"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {/* Score label inside ring */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[10.5px] font-bold tabular"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-semibold"
          style={{ color }}
        >
          {getRiskLabel(score)} Safety
        </span>
      )}
    </div>
  )
}
