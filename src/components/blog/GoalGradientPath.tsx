'use client'

import { useState } from 'react'

const STAGES = [
  { pct: 10, label: '10% there', urgency: 4, color: '#d1d5db', description: 'Abstract. Distant. Barely registers.' },
  { pct: 30, label: '30% there', urgency: 18, color: '#9ca3af', description: 'Still low. The reward feels theoretical.' },
  { pct: 50, label: '50% there', urgency: 40, color: '#6b7280', description: 'Halfway. Engagement begins to build.' },
  { pct: 70, label: '70% there', urgency: 65, color: '#374151', description: 'Noticeably stronger pull. Getting real.' },
  { pct: 85, label: '85% there', urgency: 82, color: '#1E4530', description: 'Strong pull. The reward feels almost owned.' },
  { pct: 95, label: '95% there', urgency: 96, color: '#4CAF7D', description: 'Near-compulsive. One more purchase.' },
]

export default function GoalGradientPath() {
  const [active, setActive] = useState(2)

  return (
    <div className="my-8 border border-[var(--ink)]/10 rounded-xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40">
          Goal gradient — motivation vs. distance to reward
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-end gap-2 h-32">
          {STAGES.map((s, i) => (
            <button
              key={s.pct}
              onClick={() => setActive(i)}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: `${s.urgency}%`,
                  minHeight: '4px',
                  background: i === active ? '#4CAF7D' : i < active ? '#1E4530' : '#e5e7eb',
                }}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          {STAGES.map((s, i) => (
            <div key={s.pct} className="flex-1 text-center">
              <span
                className={`text-[10px] ${i === active ? 'text-[var(--ink)] font-medium' : 'text-[var(--ink)]/30'}`}
              >
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[var(--ink)]/30">
          <span>Start of journey</span>
          <span>Reward threshold</span>
        </div>
      </div>

      {/* Detail */}
      <div className="mx-5 mb-5 mt-2 p-4 rounded-lg bg-[var(--ink)]/[0.03] border border-[var(--ink)]/8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-medium text-[var(--ink)]">{STAGES[active].label}</span>
          <span className="text-xs text-[var(--ink)]/40">motivation index: {STAGES[active].urgency}/100</span>
        </div>
        <div className="h-1.5 bg-[var(--ink)]/8 rounded-full mb-3">
          <div
            className="h-full rounded-full bg-[#4CAF7D] transition-all duration-500"
            style={{ width: `${STAGES[active].urgency}%` }}
          />
        </div>
        <p className="text-sm text-[var(--ink)]/60">{STAGES[active].description}</p>
      </div>

      <div className="px-5 pb-4 text-xs text-[var(--ink)]/40 italic">
        Click a bar to explore motivation at each stage. Same reward throughout.
      </div>
    </div>
  )
}
