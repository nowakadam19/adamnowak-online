'use client'

import { useState } from 'react'

const EVENTS = [
  {
    id: 'earn',
    label: 'Points earned',
    icon: '+',
    iconBg: '#1E4530',
    iconColor: '#fff',
    time: 'Month 1–6',
    trust: 72,
    heading: 'Accumulation phase',
    body: 'Member earns points passively. Balance grows. No action yet — but the points start to feel owned. Endowment effect is building quietly.',
    sentiment: 'neutral',
  },
  {
    id: 'notice',
    label: 'Expiry notice sent',
    icon: '!',
    iconBg: '#d97706',
    iconColor: '#fff',
    time: 'Month 9',
    trust: 60,
    heading: 'Urgency window',
    body: 'Advanced notice with a clear redemption path. Member feels the points are at risk — but has time to act. Trust dips slightly, urgency spikes. This is the lever, used correctly.',
    sentiment: 'warning',
  },
  {
    id: 'redeem',
    label: 'Redemption made',
    icon: '✓',
    iconBg: '#4CAF7D',
    iconColor: '#fff',
    time: 'Month 10',
    trust: 80,
    heading: 'Urgency converted',
    body: 'Member redeems before expiry. The endowment effect did its job. Trust recovers — the programme delivered value. This is the ideal outcome of expiry mechanics.',
    sentiment: 'positive',
  },
  {
    id: 'silent-expiry',
    label: 'Silent expiry',
    icon: '✕',
    iconBg: '#dc2626',
    iconColor: '#fff',
    time: 'Month 12',
    trust: 22,
    heading: 'Trust damage',
    body: 'Points expire without warning. Member discovers the balance is gone. Reaction is disproportionate to monetary value — the endowment effect works in reverse. Damage is difficult to recover from.',
    sentiment: 'negative',
  },
  {
    id: 'devalue',
    label: 'Point devaluation',
    icon: '↓',
    iconBg: '#7f1d1d',
    iconColor: '#fff',
    time: 'Any time',
    trust: 15,
    heading: 'Perceived theft',
    body: 'Thresholds raised, exchange rates adjusted. The math may be minor. The emotional impact is the same as silent expiry — the member feels something was taken. Loyalty erodes fast.',
    sentiment: 'negative',
  },
]

export default function EndowmentTimeline() {
  const [active, setActive] = useState(0)
  const ev = EVENTS[active]

  return (
    <div className="my-8 border border-[var(--ink)]/10 rounded-xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40">
          Endowment effect — trust over the programme lifecycle
        </div>
      </div>

      {/* Timeline selector */}
      <div className="flex overflow-x-auto border-b border-[var(--ink)]/8">
        {EVENTS.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 text-[11px] transition-colors border-b-2 ${
              i === active
                ? 'border-[#1E4530] text-[var(--ink)]'
                : 'border-transparent text-[var(--ink)]/40 hover:text-[var(--ink)]/70'
            }`}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: e.iconBg, color: e.iconColor }}
            >
              {e.icon}
            </span>
            <span className="leading-tight text-center">{e.label}</span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-[var(--ink)]/40 mb-1">{ev.time}</div>
            <div className="text-lg font-medium text-[var(--ink)]">{ev.heading}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-[var(--ink)]/40 mb-1">Trust level</div>
            <div
              className="text-2xl font-medium"
              style={{
                color: ev.trust >= 70 ? '#4CAF7D' : ev.trust >= 50 ? '#d97706' : '#dc2626',
              }}
            >
              {ev.trust}/100
            </div>
          </div>
        </div>

        <div className="h-2 bg-[var(--ink)]/8 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-600"
            style={{
              width: `${ev.trust}%`,
              background: ev.trust >= 70 ? '#4CAF7D' : ev.trust >= 50 ? '#d97706' : '#dc2626',
            }}
          />
        </div>

        <p className="text-sm text-[var(--ink)]/60 leading-relaxed">{ev.body}</p>
      </div>
    </div>
  )
}
