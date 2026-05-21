export default function EndowmentTimeline() {
  const steps = [
    { icon: '⭐', label: 'Earned', sub: 'Points arrive. Positive signal.', color: '#4CAF7D', bg: '#E8F5EF' },
    { icon: '🔒', label: 'Feels owned', sub: 'Loss aversion activates.', color: '#EF9F27', bg: '#FFF8E8' },
    { icon: '⚠️', label: 'Expires', sub: 'Trust drops. Feels like theft.', color: '#E24B4A', bg: '#FEF0EE' },
  ]

  return (
    <div className="my-8 font-sans">
      <div className="relative flex items-start">
        <div
          className="absolute top-6 left-6 right-6 h-0.5 z-0"
          style={{ background: 'linear-gradient(to right, #4CAF7D, #EF9F27, #E24B4A)' }}
        />
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2.5 relative z-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
              style={{ background: s.bg, borderColor: s.color }}
            >
              {s.icon}
            </div>
            <div className="text-xs font-semibold text-[var(--ink)] text-center">{s.label}</div>
            <div className="text-[10px] text-[var(--ink)]/40 text-center leading-snug max-w-[90px]">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-[10px] text-[var(--ink)]/30 mb-1.5">Member trust level</div>
        <div className="h-1 bg-[var(--ink)]/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: '70%', background: 'linear-gradient(to right, #4CAF7D, #EF9F27 50%, #E24B4A)' }}
          />
        </div>
      </div>
    </div>
  )
}
