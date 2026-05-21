export default function ReferenceEffect() {
  return (
    <div className="my-8 grid grid-cols-2 gap-3 font-sans">
      <div className="rounded-2xl p-5 bg-[var(--ink)]/[0.03] border border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/30 mb-3">
          No context
        </div>
        <div className="text-4xl font-semibold text-[var(--ink)]/25 mb-1">500</div>
        <div className="text-xs text-[var(--ink)]/35 mb-4">points balance</div>
        <div className="text-xs text-[var(--ink)]/30 italic mt-6">Worth what, exactly?</div>
      </div>

      <div className="rounded-2xl p-5 bg-[#E8F5EF] border border-[#A8DBBE]">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--green)]/60 mb-3">
          With context
        </div>
        <div className="text-4xl font-semibold text-[var(--green)] mb-1">500</div>
        <div className="text-xs text-[var(--green)]/70 mb-4">points — 50% to free coffee</div>
        <div className="h-1.5 bg-[var(--green)]/15 rounded-full mb-2">
          <div className="h-full bg-[var(--green-light)] rounded-full" style={{ width: '50%' }} />
        </div>
        <div className="text-xs font-medium text-[var(--green)]">One more visit gets you there.</div>
      </div>
    </div>
  )
}
