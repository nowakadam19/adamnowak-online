'use client'

import { useState } from 'react'

export default function DenominationCoins() {
  const [flipped, setFlipped] = useState<number | null>(null)

  const coins = [
    { pts: '10', label: 'points', value: '€0.10', size: 80, bg: '#F0EEE8', border: '#D3D1C7', textColor: 'rgba(10,10,8,0.4)' },
    { pts: '1,000', label: 'points', value: '€10.00', size: 120, bg: '#E8F5EF', border: '#4CAF7D', textColor: '#1E4530' },
    { pts: '10,000', label: 'points', value: '€100.00', size: 160, bg: '#1E4530', border: '#1E4530', textColor: '#fff' },
  ]

  return (
    <div className="my-8 font-sans">
      <div className="flex items-end justify-center gap-4 py-2">
        {coins.map((c, i) => (
          <button
            key={i}
            onClick={() => setFlipped(flipped === i ? null : i)}
            className="rounded-full flex flex-col items-center justify-center border-2 transition-transform hover:scale-105 flex-shrink-0"
            style={{
              width: c.size, height: c.size,
              background: c.bg, borderColor: c.border,
            }}
          >
            {flipped === i ? (
              <>
                <span className="font-bold leading-none" style={{ fontSize: c.size * 0.18, color: c.textColor }}>{c.value}</span>
                <span className="text-[9px] mt-1" style={{ color: c.textColor, opacity: 0.5 }}>same rate</span>
              </>
            ) : (
              <>
                <span className="font-bold leading-none" style={{ fontSize: c.size * 0.16, color: c.textColor }}>{c.pts}</span>
                <span className="text-[9px] mt-1" style={{ color: c.textColor, opacity: 0.5 }}>{c.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-[var(--ink)]/30 mt-3">
        Tap a coin to reveal its € value — same exchange rate across all three.
      </p>
    </div>
  )
}
