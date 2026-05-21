'use client'

import { useState } from 'react'

const CONTEXTS = [
  {
    label: 'No context',
    description: 'Balance shown with no reference frame',
    render: (pts: number) => (
      <div className="text-center py-6">
        <div className="text-5xl font-medium text-[var(--ink)] mb-2">{pts.toLocaleString()}</div>
        <div className="text-sm text-[var(--ink)]/40">points</div>
      </div>
    ),
    note: 'Meaningless number. No emotional weight.',
  },
  {
    label: 'Reward threshold',
    description: 'Points shown against what they unlock',
    render: (pts: number) => (
      <div className="py-6 space-y-3">
        <div className="flex justify-between text-sm text-[var(--ink)]/60 mb-1">
          <span>Your balance</span>
          <span className="font-medium text-[var(--ink)]">{pts.toLocaleString()} pts</span>
        </div>
        <div className="space-y-2">
          {[
            { label: '€5 voucher', threshold: 400 },
            { label: '€15 voucher', threshold: 1000 },
            { label: 'Free product', threshold: 2500 },
          ].map(({ label, threshold }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-[var(--ink)]/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((pts / threshold) * 100, 100)}%`,
                    background: pts >= threshold ? '#4CAF7D' : '#1E4530',
                  }}
                />
              </div>
              <span className={`text-xs w-24 ${pts >= threshold ? 'text-[#4CAF7D] font-medium' : 'text-[var(--ink)]/40'}`}>
                {pts >= threshold ? '✓ ' : ''}{label}
              </span>
              <span className="text-xs text-[var(--ink)]/30 w-16 text-right">{threshold.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </div>
    ),
    note: 'Now the number has direction. The gap becomes tangible.',
  },
  {
    label: 'Next reward proximity',
    description: 'Distance to the next reward, not total balance',
    render: (pts: number) => {
      const next = pts < 400 ? 400 : pts < 1000 ? 1000 : 2500
      const prev = pts < 400 ? 0 : pts < 1000 ? 400 : 1000
      const remaining = next - pts
      const pct = Math.round(((pts - prev) / (next - prev)) * 100)
      const label = pts < 400 ? '€5 voucher' : pts < 1000 ? '€15 voucher' : 'Free product'
      return (
        <div className="py-6">
          <div className="text-xs text-[var(--ink)]/40 mb-1 uppercase tracking-wider">Next reward</div>
          <div className="text-lg font-medium text-[var(--ink)] mb-4">{label}</div>
          <div className="h-2 bg-[var(--ink)]/8 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-[#1E4530] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#4CAF7D] font-medium">{pct}% there</span>
            <span className="text-[var(--ink)]/50">
              {remaining.toLocaleString()} pts to go
            </span>
          </div>
        </div>
      )
    },
    note: 'Proximity framing. Feels urgent, actionable, close.',
  },
]

export default function ReferenceEffect() {
  const [points, setPoints] = useState(500)
  const [activeContext, setActiveContext] = useState(0)

  return (
    <div className="my-8 border border-[var(--ink)]/10 rounded-xl overflow-hidden font-sans">
      <div className="px-5 pt-5 pb-3 border-b border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
          The same {points.toLocaleString()} points — three different contexts
        </div>
        <label className="flex items-center gap-3 text-sm text-[var(--ink)]/60">
          <span className="w-20">Balance</span>
          <input
            type="range" min={100} max={2400} step={100}
            value={points} onChange={e => setPoints(+e.target.value)}
            className="w-40"
          />
          <span className="font-medium text-[var(--ink)] w-20">{points.toLocaleString()} pts</span>
        </label>
      </div>

      <div className="flex border-b border-[var(--ink)]/8">
        {CONTEXTS.map((ctx, i) => (
          <button
            key={ctx.label}
            onClick={() => setActiveContext(i)}
            className={`flex-1 py-2.5 text-[11px] tracking-wide transition-colors ${
              i === activeContext
                ? 'text-[var(--ink)] border-b-2 border-[#1E4530] -mb-px font-medium'
                : 'text-[var(--ink)]/40 hover:text-[var(--ink)]/70'
            }`}
          >
            {ctx.label}
          </button>
        ))}
      </div>

      <div className="px-6 min-h-[140px]">
        {CONTEXTS[activeContext].render(points)}
      </div>

      <div className="px-5 py-3 border-t border-[var(--ink)]/8 bg-[var(--ink)]/[0.02]">
        <p className="text-xs text-[var(--ink)]/50 italic">{CONTEXTS[activeContext].note}</p>
      </div>
    </div>
  )
}
