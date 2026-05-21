'use client'

import { useState } from 'react'

export default function FramingEffect() {
  const [balance, setBalance] = useState(400)
  const threshold = 1000
  const pct = Math.round((balance / threshold) * 100)
  const remaining = threshold - balance

  return (
    <div className="my-8 border border-[var(--ink)]/10 rounded-xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-[var(--ink)]/8">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
          Same data — two framings
        </div>
        <label className="flex items-center gap-3 text-sm text-[var(--ink)]/60">
          <span className="w-20">Balance</span>
          <input
            type="range" min={50} max={950} step={50}
            value={balance} onChange={e => setBalance(+e.target.value)}
            className="w-40"
          />
          <span className="font-medium text-[var(--ink)] w-24">{balance.toLocaleString()} / {threshold.toLocaleString()} pts</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ink)]/8">
        {/* Nominal framing */}
        <div className="p-5">
          <div className="text-[10px] tracking-widest uppercase text-[var(--ink)]/40 mb-4 font-medium">
            Nominal framing
          </div>
          <div className="rounded-lg border border-[var(--ink)]/10 p-4 bg-[var(--ink)]/[0.02]">
            <div className="text-xs text-[var(--ink)]/40 mb-1">Your Points Balance</div>
            <div className="text-4xl font-medium text-[var(--ink)] mb-1">{balance.toLocaleString()}</div>
            <div className="text-xs text-[var(--ink)]/40">Reward at {threshold.toLocaleString()} points</div>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <span className="text-[#dc2626] text-sm mt-0.5">↓</span>
            <p className="text-xs text-[var(--ink)]/50 leading-relaxed">
              Raw number with no emotional context. Brain registers a large gap ({remaining.toLocaleString()} pts). Low urgency.
            </p>
          </div>
        </div>

        {/* Progress framing */}
        <div className="p-5">
          <div className="text-[10px] tracking-widest uppercase text-[var(--ink)]/40 mb-4 font-medium">
            Progress framing
          </div>
          <div className="rounded-lg border border-[#4CAF7D]/30 p-4 bg-[#4CAF7D]/[0.04]">
            <div className="text-xs text-[var(--ink)]/40 mb-2">Your next reward</div>
            <div className="h-2.5 bg-[var(--ink)]/8 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-[#1E4530] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[var(--ink)]">{pct}% complete</span>
              <span className="text-[var(--ink)]/50">{remaining.toLocaleString()} pts to go</span>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <span className="text-[#4CAF7D] text-sm mt-0.5">↑</span>
            <p className="text-xs text-[var(--ink)]/50 leading-relaxed">
              Progress + proximity framing. At {pct}%, the gap feels {pct >= 70 ? 'small and closeable' : pct >= 40 ? 'bridgeable with one visit' : 'visible and growing'}. Higher urgency.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[var(--ink)]/8 bg-[var(--ink)]/[0.02]">
        <p className="text-xs text-[var(--ink)]/50 italic">
          The gap between these framings grows as the member approaches the reward. At 80%+, the urgency difference is significant.
        </p>
      </div>
    </div>
  )
}
