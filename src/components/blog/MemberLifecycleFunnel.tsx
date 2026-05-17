'use client'

import { useState, useMemo } from 'react'

const STAGES = [
  { key: 'enrolled',  label: 'Enrolled',  desc: 'Registered',       bg: '#D3D1C7', text: '#2C2C2A' },
  { key: 'activated', label: 'Activated', desc: 'First purchase',    bg: '#9FE1CB', text: '#04342C' },
  { key: 'engaged',   label: 'Engaged',   desc: '3+ purchases',      bg: '#5DCAA5', text: '#04342C' },
  { key: 'retained',  label: 'Retained',  desc: '12-month active',   bg: '#1D9E75', text: '#E1F5EE' },
]

function fmtN(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return Math.round(n / 1_000) + 'K'
  return Math.round(n).toString()
}

export default function MemberLifecycleFunnel() {
  const [enrolled, setEnrolled] = useState(500_000)
  const [activRate, setActivRate] = useState(32)
  const [engRate, setEngRate] = useState(45)
  const [retRate, setRetRate] = useState(60)

  const counts = useMemo(() => {
    const a = enrolled * activRate / 100
    const e = a * engRate / 100
    const r = e * retRate / 100
    return [enrolled, a, e, r]
  }, [enrolled, activRate, engRate, retRate])

  const pcts = counts.map(c => Math.round(c / enrolled * 100))
  const dropPcts = [
    100 - activRate,
    100 - engRate,
    100 - retRate,
  ]

  const MAX_H = 160
  const MIN_H = 32

  return (
    <div className="my-8 font-sans">
      {/* Controls */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-xs text-[var(--ink)]/60">
        {[
          { label: 'Enrolled', val: fmtN(enrolled), setter: (v: number) => setEnrolled(v), min: 10000, max: 2000000, step: 10000, current: enrolled },
          { label: '→ Activated', val: activRate + '%', setter: (v: number) => setActivRate(v), min: 5, max: 70, step: 1, current: activRate },
          { label: '→ Engaged', val: engRate + '%', setter: (v: number) => setEngRate(v), min: 5, max: 80, step: 1, current: engRate },
          { label: '→ Retained', val: retRate + '%', setter: (v: number) => setRetRate(v), min: 5, max: 80, step: 1, current: retRate },
        ].map(ctrl => (
          <label key={ctrl.label} className="flex items-center gap-2">
            <span>{ctrl.label}</span>
            <input
              type="range"
              min={ctrl.min} max={ctrl.max} step={ctrl.step}
              value={ctrl.current}
              onChange={e => ctrl.setter(+e.target.value)}
              className="w-20"
            />
            <span className="font-medium text-[var(--ink)] min-w-[36px]">{ctrl.val}</span>
          </label>
        ))}
      </div>

      {/* Funnel bars */}
      <div className="grid grid-cols-4 gap-0 mb-6 relative">
        {STAGES.map((s, i) => {
          const barH = Math.max(MIN_H, Math.round(MAX_H * (pcts[i] / 100)))
          return (
            <div key={s.key} className="flex flex-col items-center relative px-1">
              <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-2 text-center">
                {s.label}
              </div>
              <div
                className="w-4/5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-500"
                style={{ height: barH, background: s.bg }}
              >
                <span className="text-xl font-medium" style={{ color: s.text }}>{pcts[i]}%</span>
                <span className="text-[10px] opacity-70" style={{ color: s.text }}>{fmtN(counts[i])}</span>
              </div>
              <div className="text-[10px] text-[var(--ink)]/30 text-center mt-1.5 leading-tight">{s.desc}</div>

              {i < 3 && (
                <div className="absolute right-[-14px] top-8 flex flex-col items-center gap-1 z-10">
                  <span className="text-sm text-[var(--ink)]/30">→</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--ink)]/5 text-[var(--ink)]/50 border border-[var(--ink)]/10 whitespace-nowrap">
                    −{dropPcts[i]}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Lost at enrollment', val: fmtN(counts[0] - counts[1]), note: 'never transacted' },
          { label: 'Lost at activation', val: fmtN(counts[1] - counts[2]), note: 'one-and-done' },
          { label: 'Lost at engagement', val: fmtN(counts[2] - counts[3]), note: "didn't habituate" },
          { label: 'Funnel efficiency', val: pcts[3] + '%', note: 'enrolled → retained' },
        ].map(m => (
          <div key={m.label} className="bg-[var(--ink)]/[0.03] rounded-lg p-3">
            <div className="text-[10px] text-[var(--ink)]/40 mb-1">{m.label}</div>
            <div className="text-sm font-medium text-[var(--ink)]">{m.val}</div>
            <div className="text-[10px] text-[var(--ink)]/30 mt-0.5">{m.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
