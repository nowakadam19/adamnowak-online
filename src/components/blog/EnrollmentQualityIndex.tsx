'use client'

import { useState } from 'react'

function fmt(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(Math.round(n))
}

export default function EnrollmentQualityIndex() {
  const [enrolled, setEnrolled] = useState(2000000)
  const [optinRate, setOptinRate] = useState(45)
  const [activRate, setActivRate] = useState(22)

  const optin = enrolled * optinRate / 100
  const activ = enrolled * activRate / 100
  const unused = enrolled - Math.max(optin, activ)
  const pctNeverTransacted = 100 - activRate

  const optinStatus =
    optinRate >= 65 ? 'above' : optinRate >= 50 ? 'approaching' : 'below'

  return (
    <div className="my-8 font-sans">
      {/* Controls */}
      <div className="flex flex-nowrap gap-4 mb-6 text-sm text-[var(--ink)] opacity-70">
        <label className="flex items-center gap-2">
          Enrolled
          <input type="range" min={100000} max={5000000} step={100000}
            value={enrolled} onChange={e => setEnrolled(+e.target.value)}
            className="w-28" />
          <span className="font-medium opacity-100 text-[var(--ink)] min-w-[80px]">
            {fmt(enrolled)}
          </span>
        </label>
        <label className="flex items-center gap-2">
          Opt-in
          <input type="range" min={10} max={90} step={1}
            value={optinRate} onChange={e => setOptinRate(+e.target.value)}
            className="w-24" />
          <span className="font-medium opacity-100 text-[var(--ink)] min-w-[32px]">
            {optinRate}%
          </span>
        </label>
        <label className="flex items-center gap-2">
          Activation
          <input type="range" min={5} max={70} step={1}
            value={activRate} onChange={e => setActivRate(+e.target.value)}
            className="w-24" />
          <span className="font-medium opacity-100 text-[var(--ink)] min-w-[32px]">
            {activRate}%
          </span>
        </label>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 border border-[var(--ink)]/10 rounded-lg overflow-hidden">
        {/* Enrolled */}
        <div className="p-5 border-r border-[var(--ink)]/10">
          <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
            Enrolled
          </div>
          <div className="text-3xl font-medium text-[var(--ink)] mb-1">
            {fmt(enrolled)}
          </div>
          <div className="text-xs text-[var(--ink)]/50 mb-4">total members</div>
          <div className="h-1 bg-[var(--ink)]/8 rounded-full mb-1">
            <div className="h-full bg-[var(--ink)]/30 rounded-full w-full" />
          </div>
          <div className="text-xs text-[var(--ink)]/40">100%</div>
          <div className="text-xs text-[var(--ink)]/50 border-t border-[var(--ink)]/8 pt-3 mt-4 leading-relaxed">
            Starting point. <span className="font-medium text-[var(--ink)]/80">Not a result.</span>
          </div>
        </div>

        {/* Opted-in */}
        <div className="p-5 border-r border-[var(--ink)]/10">
          <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
            Opted-in
          </div>
          <div className={`text-3xl font-medium mb-1 ${optinStatus === 'above' ? 'text-[var(--green)]' : 'text-[var(--ink)]'}`}>
            {fmt(optin)}
          </div>
          <div className="text-xs text-[var(--ink)]/50 mb-4">{optinRate}% of enrolled</div>
          <div className="h-1 bg-[var(--ink)]/8 rounded-full mb-1">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${optinRate}%`,
                background: optinStatus === 'above' ? '#4CAF7D' : optinStatus === 'approaching' ? '#BA7517' : '#D85A30'
              }}
            />
          </div>
          <div className="text-xs text-[var(--ink)]/40">{optinRate}%</div>
          <div className="text-xs text-[var(--ink)]/50 border-t border-[var(--ink)]/8 pt-3 mt-4 leading-relaxed">
            Reachable base.{' '}
            <span className={`font-medium ${optinStatus === 'above' ? 'text-[var(--green)]' : 'text-[var(--ink)]/80'}`}>
              {optinStatus === 'above' ? 'Above benchmark ✓' : 'Benchmark: 65%+'}
            </span>
          </div>
        </div>

        {/* Activated */}
        <div className="p-5">
          <div className="text-[10px] font-medium tracking-widest uppercase text-[var(--ink)]/40 mb-3">
            Activated
          </div>
          <div className="text-3xl font-medium text-[var(--green)] mb-1">
            {fmt(activ)}
          </div>
          <div className="text-xs text-[var(--ink)]/50 mb-4">{activRate}% of enrolled</div>
          <div className="h-1 bg-[var(--ink)]/8 rounded-full mb-1">
            <div
              className="h-full bg-[var(--green-light)] rounded-full transition-all duration-500"
              style={{ width: `${activRate}%` }}
            />
          </div>
          <div className="text-xs text-[var(--ink)]/40">{activRate}%</div>
          <div className="text-xs text-[var(--ink)]/50 border-t border-[var(--ink)]/8 pt-3 mt-4 leading-relaxed">
            First transaction done.{' '}
            <span className="font-medium text-[var(--ink)]/80">
              {pctNeverTransacted}% never transacted.
            </span>
          </div>
        </div>
      </div>

      {/* Status row */}
      <div className="mt-3 border border-[var(--ink)]/10 rounded-md divide-y divide-[var(--ink)]/8">
        <div className="flex items-center gap-3 px-4 py-2.5 text-xs">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${optinStatus === 'above' ? 'bg-[#4CAF7D]' : optinStatus === 'approaching' ? 'bg-[#BA7517]' : 'bg-[#D85A30]'}`} />
          <span className="text-[var(--ink)]/50 w-20">Opt-in</span>
          <span className="font-medium text-[var(--ink)]">{optinRate}%</span>
          <span className="text-[var(--ink)]/40 ml-auto">
            {optinStatus === 'above' ? 'Above benchmark' : optinStatus === 'approaching' ? 'Approaching 65% benchmark' : 'Below benchmark (65%)'}
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[var(--green-light)]" />
          <span className="text-[var(--ink)]/50 w-20">Activation</span>
          <span className="font-medium text-[var(--ink)]">{activRate}%</span>
          <span className="text-[var(--ink)]/40 ml-auto">{pctNeverTransacted}% never transacted</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#BA7517]" />
          <span className="text-[var(--ink)]/50 w-20">Unused</span>
          <span className="font-medium text-[var(--ink)]">{fmt(unused)}</span>
          <span className="text-[var(--ink)]/40 ml-auto">no consent + no transaction</span>
        </div>
      </div>
    </div>
  )
}
