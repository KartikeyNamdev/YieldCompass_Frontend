'use client'

import type { Profile } from '@/lib/hooks/useProtocols'

const PROFILES: { id: Profile; label: string; description: string }[] = [
  {
    id: 'conservative',
    label: 'Conservative',
    description: 'Risk score ≥ 75. Audited, stable protocols only.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Risk score ≥ 55. Mix of safety and yield.',
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'All protocols. Higher yield, higher risk.',
  },
]

interface ProfileFilterProps {
  value: Profile
  onChange: (profile: Profile) => void
}

export function ProfileFilter({ value, onChange }: ProfileFilterProps) {
  const selected = PROFILES.find((p) => p.id === value)

  return (
    <div className="flex flex-col gap-2">
      {/* Segmented control */}
      <div
        role="group"
        aria-label="Risk profile filter"
        className="inline-flex bg-[#F1F5F9] rounded-xl p-1 gap-0.5"
      >
        {PROFILES.map((profile) => (
          <button
            key={profile.id}
            id={`profile-${profile.id}`}
            onClick={() => onChange(profile.id)}
            aria-pressed={value === profile.id}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${
              value === profile.id
                ? 'bg-white text-[var(--color-accent)] shadow-card'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {profile.label}
          </button>
        ))}
      </div>
      {/* Description */}
      {selected && (
        <p className="text-xs text-[var(--color-text-secondary)] pl-1 animate-fade-in">
          {selected.description}
        </p>
      )}
    </div>
  )
}
