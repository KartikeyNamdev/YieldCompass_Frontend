'use client'
export function SeriesDetailContent({ id }: { id: string }) {
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="card p-8 text-center text-[var(--color-text-secondary)] text-sm">
        Vault series <strong className="text-[var(--color-accent)]">{id}</strong> — built in Phase F4.
      </div>
    </div>
  )
}
