'use client'

import { useState } from 'react'

export default function GoalGradientPath() {
  const [value, setValue] = useState(30)

  const motiv = value < 30
    ? { label: 'Low', color: '#C8C6BC' }
    : value < 60
    ? { label: 'Building', color: '#EF9F27' }
    : value < 80
    ? { label: 'Strong', color: '#4CAF7D' }
    : { label: 'Very strong', color: '#1E4530' }

  const bgR = Math.round(240 - value * 0.5)
  const bgG = Math.round(232 + value * 0.2)
  const bgB = Math.round(220 - value * 0.5)

  return (
    <div className="my-8 font-sans">
      <div
        className="relative h-14 rounded-full overflow-hidden mb-3 transition-all duration-300"
        style={{ background: `rgb(${bgR},${bgG},${bgB})` }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-200"
          style={{
            width: `${value}%`,
            background: 'linear-gradient(to right, #D3D1C7, #4CAF7D)',
            opacity: 0.5
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-[var(--green)] flex items-center justify-center text-lg shadow-sm transition-all duration-200 z-10"
          style={{ left: `${value}%` }}
        >
          🚶
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl z-10">🎁</div>
      </div>

      <input
        type="range" min={2} max={92} value={value}
        onChange={e => setValue(+e.target.value)}
        className="w-full mb-2"
      />

      <div className="flex justify-between text-xs">
        <span className="text-[var(--ink)]/40">{value}% to reward</span>
        <span className="font-semibold transition-colors duration-300" style={{ color: motiv.color }}>
          Motivation: {motiv.label}
        </span>
      </div>
      <div className="flex justify-between text-[10px] text-[var(--ink)]/25 mt-1">
        <span>Enrolled</span><span>Reward</span>
      </div>
    </div>
  )
}
