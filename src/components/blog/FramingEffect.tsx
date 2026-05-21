'use client'

import { useState } from 'react'

export default function FramingEffect() {
  const [progress, setProgress] = useState(40)
  const pts = Math.round(progress * 10)
  const remaining = 1000 - pts
  const circumference = 175.9
  const offset = circumference * (1 - progress / 100)

  return (
    <div className="my-8 font-sans">
      <div className="flex items-center gap-3 mb-5 text-xs text-[var(--ink)]/50">
        <span>Progress</span>
        <input type="range" min={5} max={99} value={progress}
          onChange={e => setProgress(+e.target.value)} className="flex-1" />
        <span className="font-semibold text-[var(--ink)] min-w-[32px]">{progress}%</span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-[#1A1A18] rounded-3xl p-3">
          <div className="bg-[var(--paper)] rounded-2xl h-48 flex flex-col items-center justify-center gap-2 px-4">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-[var(--ink)]/30">
              Nominal
            </div>
            <div className="text-3xl font-semibold text-[var(--ink)]">{pts} pts</div>
            <div className="text-[10px] text-[var(--ink)]/40 text-center">Reward at 1,000 points</div>
          </div>
        </div>

        <div className="bg-[var(--green)] rounded-3xl p-3">
          <div className="bg-[#E8F5EF] rounded-2xl h-48 flex flex-col items-center justify-center gap-2 px-4">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-[var(--green)]/60">
              Progress
            </div>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
                <circle cx="35" cy="35" r="28" fill="none" stroke="#C5E8D5" strokeWidth="6" />
                <circle cx="35" cy="35" r="28" fill="none" stroke="#1E4530" strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--green)]">
                {progress}%
              </div>
            </div>
            <div className="text-[10px] text-[var(--green)]/70 text-center">
              {remaining > 0 ? `${remaining} pts to reward` : 'Reward unlocked!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
