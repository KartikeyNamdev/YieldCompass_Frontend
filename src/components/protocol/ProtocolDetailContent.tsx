'use client'
// Full implementation: Phase F2
export function ProtocolDetailContent({ id }: { id: string }) {
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="card p-8 text-center text-[var(--color-text-secondary)]">
        <p className="text-sm font-medium">Protocol: <strong className="text-[var(--color-accent)]">{id}</strong></p>
        <p className="text-xs mt-2">Full detail page — built in Phase F2.</p>
      </div>
    </div>
  )
}
