'use client'

import { useState, useEffect } from 'react'
import { useProtocols, type Profile } from '@/lib/hooks/useProtocols'
import { SummaryCards } from './SummaryCards'
import { ProfileFilter } from './ProfileFilter'
import { ProtocolTable } from './ProtocolTable'
import { Clock } from 'lucide-react'

export function ExplorerContent() {
  const [profile, setProfile] = useState<Profile>('balanced')
  const { data: pools = [], isLoading, error, dataUpdatedAt } = useProtocols(profile)
  const [updatedMinAgo, setUpdatedMinAgo] = useState<number | null>(null)

  useEffect(() => {
    if (dataUpdatedAt <= 0) return
    const updateTime = () => {
      setUpdatedMinAgo(Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 60000)))
    }
    // Set via async timeout to avoid synchronous cascading render warning
    const timeoutId = setTimeout(updateTime, 0)
    const intervalId = setInterval(updateTime, 60000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [dataUpdatedAt])

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Yield Explorer
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            See what pools <em>actually</em> earned — not just what they advertise.
          </p>
        </div>
        {updatedMinAgo !== null && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Clock size={12} />
            Last updated {updatedMinAgo === 0 ? 'just now' : `${updatedMinAgo}m ago`}
          </span>
        )}
      </div>

      {/* Summary cards */}
      {pools.length > 0 && <SummaryCards pools={pools} />}

      {/* Profile filter */}
      <ProfileFilter value={profile} onChange={setProfile} />

      {/* Protocol table */}
      <ProtocolTable
        pools={pools}
        profile={profile}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
