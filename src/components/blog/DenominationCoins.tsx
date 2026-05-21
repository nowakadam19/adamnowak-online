'use client'

import { useState } from 'react'

const SCHEMES = [
  {
    id: 'small',
    label: 'Low denomination',
    rate: '1 pt per €1',
    earn: 10,
    threshold: 100,
    unit: 'pts',
    description: '10 points for a €10 purchase. Balance grows slowly. Feels like nothing.',
    perception: 18,
  },
  {
    id: 'medium',
    label: 'Mid denomination',
    rate: '100 pts per €1',
    earn: 1000,
    threshold: 10000,
    unit: 'pts',
    description: '1,000 points for a €10 purchase. Progress feels visible. Accumulation is satisfying.',
    perception: 62,
  },
  {
    id: 'large',
    label: 'High denomination',
    rate: '1,000 pts per €1',
    earn: 10000,
    threshold: 100000,
    unit: 'pts',
    description: '10,000 points for a €10 purchase. Balance looks impressive. Strong sense of accumulation.',
    perception: 88,
  },
]

export default function DenominationCoins() {
  const [active, setActive] = useState(1)
  const [purchases, setPurchases] = useState(3)
  const scheme = SCHEMES[active]
  const balance = scheme.earn * purchases
  const pct = Math.min((balance / scheme.threshold) * 100, 100)

  return (
    <div className="my-8 border border-[var(--ink)]/10 rounded-xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
          Denomination effect — same value, different perception
        </div>
        <div className="text-xs text-[var(--ink)]/50">All schemes represent identical underlying value (1% of spend)</div>
      </div>

      {/* Scheme selector */}
      <div className="flex border-b border-[var(--ink)]/8">
        {SCHEMES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`flex-1 py-3 text-[11px] tracking-wide transition-colors border-b-2 -mb-px ${
              i === active
                ? 'border-[#1E4530] text-[var(--ink)] font-medium'
                : 'border-transparent text-[var(--ink)]/40 hover:text-[var(--ink)]/70'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Purchase slider */}
        <label className="flex items-center gap-3 text-sm text-[var(--ink)]/60 mb-5">
          <span className="w-24 text-xs">€10 purchases</span>
          <input
            type="range" min={1} max={10} step={1}
            value={purchases} onChange={e => setPurchases(+e.target.value)}
            className="w-36"
          />
          <span className="font-medium text-[var(--ink)] w-4">{purchases}</span>
        </label>

        {/* Balance display */}
        <div className="rounded-lg border border-[var(--ink)]/10 p-4 mb-4 bg-[var(--ink)]/[0.02]">
          <div className="text-xs text-[var(--ink)]/40 mb-1">Your balance after {purchases} purchase{purchases !== 1 ? 's' : ''}</div>
          <div className="text-4xl font-medium text-[var(--ink)] mb-0.5">{balance.toLocaleString()}</div>
          <div className="text-xs text-[var(--ink)]/40">{scheme.unit} · {scheme.rate}</div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--ink)]/50 mb-1.5">
            <span>{Math.round(pct)}% to first reward</span>
            <span>{scheme.threshold.toLocaleString()} pts threshold</span>
          </div>
          <div className="h-2 bg-[var(--ink)]/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1E4530] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Perception meter */}
        <div className="rounded-lg bg-[var(--ink)]/[0.03] border border-[var(--ink)]/8 p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[var(--ink)]/50">Perceived accumulation</span>
            <span
              className="text-lg font-medium"
              style={{ color: scheme.perception >= 70 ? '#4CAF7D' : scheme.perception >= 40 ? '#d97706' : '#9ca3af' }}
            >
              {scheme.perception}/100
            </span>
          </div>
          <div className="h-1.5 bg-[var(--ink)]/8 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${scheme.perception}%`,
                background: scheme.perception >= 70 ? '#4CAF7D' : scheme.perception >= 40 ? '#d97706' : '#9ca3af',
              }}
            />
          </div>
          <p className="text-xs text-[var(--ink)]/50 leading-relaxed">{scheme.description}</p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[var(--ink)]/8 bg-[var(--ink)]/[0.02]">
        <p className="text-xs text-[var(--ink)]/50 italic">
          Underlying redemption value is identical across all three schemes. Only the denomination changes.
        </p>
      </div>
    </div>
  )
}
