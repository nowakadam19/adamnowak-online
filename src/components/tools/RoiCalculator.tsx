"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import {
  calculate,
  DEFAULT_INPUTS,
  ROI_BENCHMARK,
  INDUSTRY_UPLIFT_RANGE,
  type RoiInputs,
} from "@/lib/roi-calculations"

const PARAM_KEYS: Record<keyof RoiInputs, string> = {
  totalMembers: "m", activePct: "ap", avgSpend: "sp", pointsCostPct: "pc",
  techCost: "tc", opsCost: "oc", mktCost: "mc", freqUplift: "fu",
  basketUplift: "bu", retentionUplift: "ru", referralRate: "rr",
  grossMarginPct: "gm", measuredIncremental: "mi",
}

function inputsToParams(inputs: RoiInputs): URLSearchParams {
  const p = new URLSearchParams()
  for (const [key, paramKey] of Object.entries(PARAM_KEYS)) {
    const v = inputs[key as keyof RoiInputs]
    if (v !== undefined && v !== null) p.set(paramKey, String(v))
  }
  return p
}

function paramsToInputs(params: URLSearchParams): Partial<RoiInputs> {
  const out: Partial<RoiInputs> = {}
  for (const [key, paramKey] of Object.entries(PARAM_KEYS)) {
    const raw = params.get(paramKey)
    if (raw !== null && raw !== "") {
      const num = Number(raw)
      if (!isNaN(num)) (out as Record<string, number>)[key] = num
    }
  }
  return out
}

const fmtEur = (n: number) => "€" + Math.round(n).toLocaleString("en-GB")
const fmtPct = (n: number, decimals = 1) => (Math.round(n * 10 ** decimals) / 10 ** decimals).toFixed(decimals) + "%"
const fmtMultiple = (n: number) => "€" + (Math.round(n * 100) / 100).toFixed(2)

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close) }
  }, [open])
  return (
    <span ref={ref} className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onTouchStart={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
      <span aria-label="More information"
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-semibold cursor-default select-none"
        style={{ background: "rgba(10,10,8,0.1)", color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>?</span>
      {open && (
        <span role="tooltip"
          className="absolute z-20 left-5 top-0 text-[11px] leading-snug rounded px-2 py-1.5 w-44 pointer-events-none"
          style={{ background: "var(--ink)", color: "#fff", fontFamily: "Inter, sans-serif" }}>{text}</span>
      )}
    </span>
  )
}

interface SliderInputProps {
  label: string; tooltip: string; value: number; min: number; max: number
  step: number; prefix?: string; suffix?: string; onChange: (v: number) => void
}

function SliderInput({ label, tooltip, value, min, max, step, prefix, suffix, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
          {label}<Tooltip text={tooltip} />
        </span>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))) }}
          className="text-right text-[12px] font-semibold w-24 bg-transparent border-b focus:outline-none"
          style={{ color: "var(--green)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #4CAF7D 0%, #4CAF7D ${pct}%, rgba(10,10,8,0.12) ${pct}%, rgba(10,10,8,0.12) 100%)`,
          height: "4px",
          borderRadius: "2px",
          outline: "none",
          WebkitAppearance: "none",
          appearance: "none",
        }}
        aria-label={label} />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.14em] uppercase mb-3 pb-2 border-b"
      style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }}>
      {children}
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; accent?: boolean; sub?: string }) {
  return (
    <div className="rounded-md p-3" style={{ background: "var(--paper)" }}>
      <div className="text-[11px] mb-0.5" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>{label}</div>
      <div className="font-medium leading-tight" style={{ fontSize: "0.95rem", color: "var(--ink)", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{value}</div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{sub}</div>}
    </div>
  )
}

function OutCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border mb-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-4 py-2.5 border-b text-[10px] tracking-[0.12em] uppercase"
        style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function RoiCalculator() {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.toString()) {
      setInputs({ ...DEFAULT_INPUTS, ...paramsToInputs(params) })
    }
  }, [])
  const [copied, setCopied] = useState(false)
  const [howToOpen, setHowToOpen] = useState(false)
  const [defsOpen, setDefsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const result = useMemo(() => calculate(inputs), [inputs])
  const set = useCallback((key: keyof RoiInputs) => (v: number) => setInputs((prev) => ({ ...prev, [key]: v })), [])

  useEffect(() => {
    const params = inputsToParams(inputs)
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`)
  }, [inputs])

  const reset = () => setInputs(DEFAULT_INPUTS)

  const copyResults = () => {
    const r = result
    const text = `LOYALTY PROGRAMME ROI SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Required lift to break even:  ${fmtPct(r.requiredLift.pct)} of member base revenue
                               = ${fmtEur(r.requiredLift.perMember)} per active member/year

Revenue Multiple:  ${fmtMultiple(r.roi.revenueMultiple)} per €1 invested
Standard ROI:      ${Math.round(r.roi.standardRoi)}%${r.roi.marginRoi !== undefined ? `\nMargin ROI:        ${Math.round(r.roi.marginRoi)}%` : ""}

Incremental revenue:  ${fmtEur(r.revenue.total)}/year
Total programme cost: ${fmtEur(r.costs.total)}/year
Breakeven:            ${r.breakevenMonths > 36 ? "36+ months" : (Math.round(r.breakevenMonths * 10) / 10).toFixed(1) + " months"}

Revenue breakdown:
  Frequency uplift:  ${fmtEur(r.revenue.frequency)}
  Basket uplift:     ${fmtEur(r.revenue.basket)}
  Retention value:   ${fmtEur(r.revenue.retention)}
  Referral value:    ${fmtEur(r.revenue.referral)}

Assumptions: ${inputs.totalMembers.toLocaleString("en-GB")} members · ${inputs.activePct}% active · ${fmtEur(inputs.avgSpend)} avg spend/year
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source: adamnowak.online/tools/roi-calculator`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const submitFeedback = async () => {
    if (!feedback.trim()) return
    try {
      await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: feedback }) })
    } catch (_) {}
    setFeedbackSent(true)
    setFeedback("")
  }

  const r = result
  const breakevenDisplay = r.breakevenMonths > 36 ? "36+ months" : (Math.round(r.breakevenMonths * 10) / 10).toFixed(1) + " months"
  const breakevenFill = Math.min((r.breakevenMonths / 36) * 100, 100)
  const liftRiskLabel = { low: "Easy to defend — well below typical programme lift", moderate: "Achievable with a well-run programme", high: "Requires strong uplift evidence" }[r.requiredLift.risk]
  const liftRiskColor = { low: "var(--gl)", moderate: "#d97706", high: "#dc2626" }[r.requiredLift.risk]
  const roiBenchmarkLabel = r.roi.standardRoi > ROI_BENCHMARK.high ? `↑ Above typical range (${ROI_BENCHMARK.low}–${ROI_BENCHMARK.high}%)` : r.roi.standardRoi < ROI_BENCHMARK.low ? `↓ Below typical range (${ROI_BENCHMARK.low}–${ROI_BENCHMARK.high}%)` : `✓ Within typical range (${ROI_BENCHMARK.low}–${ROI_BENCHMARK.high}%)`
  const roiBenchmarkBg = r.roi.standardRoi >= ROI_BENCHMARK.low && r.roi.standardRoi <= ROI_BENCHMARK.high ? "rgba(76,175,125,0.12)" : r.roi.standardRoi > ROI_BENCHMARK.high ? "rgba(76,175,125,0.08)" : "rgba(220,38,38,0.08)"
  const roiBenchmarkColor = r.roi.standardRoi >= ROI_BENCHMARK.low ? "var(--green)" : "#b84040"

  return (
    <div style={{ "--ink": "#0A0A08", "--paper": "#EFEFEB", "--green": "#1E4530", "--gl": "#4CAF7D", "--muted": "#6b6b68", "--border": "rgba(10,10,8,0.12)", "--card": "#ffffff", fontFamily: "Inter, sans-serif", color: "var(--ink)" } as React.CSSProperties}>
      <details open={howToOpen} onToggle={(e) => setHowToOpen((e.target as HTMLDetailsElement).open)}
        className="mb-4 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <summary className="px-4 py-3 cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)", listStyle: "none" }}>
          <span>How to use this calculator</span>
          {howToOpen
            ? <span style={{ color: "var(--muted)" }}>−</span>
            : <span style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif", fontSize: "11px" }}>Start here →</span>
          }
        </summary>
        <div className="px-4 pb-4 text-[13px] leading-relaxed space-y-2" style={{ color: "var(--muted)" }}>
          <p><strong style={{ color: "var(--ink)" }}>1. Start with Programme Size.</strong> Enter your total member base, the share who are active, and their average annual spend.</p>
          <p><strong style={{ color: "var(--ink)" }}>2. Set your costs.</strong> Include all costs: points/rewards, technology, staff, and marketing.</p>
          <p><strong style={{ color: "var(--ink)" }}>3. Read Required Lift first.</strong> This is how much member spend needs to increase for the programme to pay for itself.</p>
          <p><strong style={{ color: "var(--ink)" }}>4. Review the three ROI variants.</strong> Revenue Multiple for CFO conversations; Standard ROI for investment comparisons; Margin ROI if you know your gross margin.</p>
          <p><strong style={{ color: "var(--ink)" }}>Share your scenario</strong> using the Share URL button — all inputs are encoded in the link.</p>
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-5 lg:border-r" style={{ borderColor: "var(--border)" }}>
          <SectionTitle>Programme Size</SectionTitle>
          <SliderInput label="Total enrolled members" tooltip="Total database size — enrolled but not necessarily active" value={inputs.totalMembers} min={10000} max={5000000} step={10000} prefix="  " onChange={set("totalMembers")} />
          <SliderInput label="Active members" tooltip="% who transacted at least once in the past 12 months" value={inputs.activePct} min={5} max={80} step={1} suffix="%" onChange={set("activePct")} />
          <SliderInput label="Avg. annual spend per active member" tooltip="Gross revenue per active member per year" value={inputs.avgSpend} min={100} max={5000} step={50} prefix="€" onChange={set("avgSpend")} />
          <div className="mt-5 mb-1"><SectionTitle>Programme Costs</SectionTitle></div>
          <SliderInput label="Points / rewards cost" tooltip="Redemption cost as % of member spend — typically 1–2.5%" value={inputs.pointsCostPct} min={0.5} max={5} step={0.1} suffix="%" onChange={set("pointsCostPct")} />
          <SliderInput label="Technology & platform" tooltip="Annual licensing, SaaS, or platform build/run cost" value={inputs.techCost} min={0} max={2000000} step={10000} prefix="€" onChange={set("techCost")} />
          <SliderInput label="Operations & staff" tooltip="FTE and agency cost directly attributed to the programme" value={inputs.opsCost} min={0} max={1000000} step={5000} prefix="€" onChange={set("opsCost")} />
          <SliderInput label="Marketing & comms" tooltip="Email, push, paid, events — programme-specific spend only" value={inputs.mktCost} min={0} max={500000} step={5000} prefix="€" onChange={set("mktCost")} />
          <div className="mt-5 mb-1"><SectionTitle>Uplift Assumptions</SectionTitle></div>
          <SliderInput label="Purchase frequency uplift" tooltip="% increase in transaction frequency vs. non-members" value={inputs.freqUplift} min={0} max={50} step={1} suffix="%" onChange={set("freqUplift")} />
          <SliderInput label="Average basket uplift" tooltip="% increase in average transaction value vs. non-members" value={inputs.basketUplift} min={0} max={30} step={1} suffix="%" onChange={set("basketUplift")} />
          <SliderInput label="Retention improvement" tooltip="% reduction in churn — retained members preserve base revenue" value={inputs.retentionUplift} min={0} max={30} step={1} suffix="%" onChange={set("retentionUplift")} />
          <SliderInput label="New members from referral" tooltip="Net new enrolled members per year driven by referral mechanics" value={inputs.referralRate} min={0} max={50000} step={500} prefix="  " onChange={set("referralRate")} />
          <div className="mt-5 mb-1"><SectionTitle>Optional</SectionTitle></div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
                Gross margin %<Tooltip text="Unlocks Margin ROI — enter your product/service gross margin to see profit-adjusted return" />
              </span>
              <input type="number" placeholder="e.g. 40" value={inputs.grossMarginPct ?? ""} min={1} max={100}
                onChange={(e) => { const v = e.target.value === "" ? undefined : parseFloat(e.target.value); setInputs((p) => ({ ...p, grossMarginPct: v })) }}
                className="text-right text-[12px] font-semibold w-24 bg-transparent border-b focus:outline-none"
                style={{ color: "var(--green)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }} />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
                Measured incremental revenue<Tooltip text="If you have test/control data, enter your measured incremental revenue here — overrides uplift assumptions" />
              </span>
              <input type="number" placeholder="€" value={inputs.measuredIncremental ?? ""} min={0}
                onChange={(e) => { const v = e.target.value === "" ? undefined : parseFloat(e.target.value); setInputs((p) => ({ ...p, measuredIncremental: v })) }}
                className="text-right text-[12px] font-semibold w-24 bg-transparent border-b focus:outline-none"
                style={{ color: "var(--green)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }} />
            </div>
            {inputs.measuredIncremental && <p className="text-[10px] mt-1" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>✓ Using measured data — uplift assumptions ignored</p>}
          </div>
        </div>

        <div className="p-5" style={{ background: "#fafaf8" }}>
          <div className="rounded-lg p-5 mb-3" style={{ background: "var(--green)" }}>
            <div className="text-[10px] tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Syne, sans-serif" }}>Required lift to break even</div>
            <div className="leading-none mb-1" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "3.2rem", color: "#fff" }}>{fmtPct(r.requiredLift.pct)}</div>
            <div className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>of active member base revenue<span className="mx-2 opacity-40">·</span>{fmtEur(r.requiredLift.perMember)} per member/year</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "Syne, sans-serif" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: liftRiskColor }} />{liftRiskLabel}
            </div>
            <div className="mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Syne, sans-serif" }}>Industry programmes typically deliver {INDUSTRY_UPLIFT_RANGE.low}–{INDUSTRY_UPLIFT_RANGE.high}% uplift</div>
          </div>

          <OutCard title="Return on Investment">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start justify-between p-3 rounded-md" style={{ background: "var(--paper)" }}>
                <div>
                  <div className="text-[11px] font-medium mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>Revenue Multiple</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>Every €1 invested returns...</div>
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 500, fontSize: "1rem", color: "var(--ink)" }}>{fmtMultiple(r.roi.revenueMultiple)}</div>
              </div>
              <div className="flex items-start justify-between p-3 rounded-md" style={{ background: "var(--paper)" }}>
                <div>
                  <div className="text-[11px] font-medium mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>Standard ROI</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>(Incremental − Cost) / Cost</div>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: roiBenchmarkBg, color: roiBenchmarkColor, fontFamily: "Syne, sans-serif" }}>{roiBenchmarkLabel}</span>
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 500, fontSize: "1rem", color: "var(--ink)" }}>{Math.round(r.roi.standardRoi)}%</div>
              </div>
              {r.roi.marginRoi !== undefined ? (
                <div className="flex items-start justify-between p-3 rounded-md" style={{ background: "var(--paper)" }}>
                  <div>
                    <div className="text-[11px] font-medium mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>Margin ROI</div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>(Incremental × {inputs.grossMarginPct}% margin − Cost) / Cost</div>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 500, fontSize: "1rem", color: "var(--ink)" }}>{Math.round(r.roi.marginRoi)}%</div>
                </div>
              ) : (
                <div className="text-[11px] px-3 py-2 rounded-md" style={{ color: "var(--muted)", background: "var(--paper)", fontFamily: "Syne, sans-serif" }}>Enter gross margin % in Optional inputs to unlock Margin ROI</div>
              )}
            </div>
          </OutCard>

          <OutCard title="Revenue Impact">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <MetricCard label="Frequency uplift" value={fmtEur(r.revenue.frequency)} accent />
              <MetricCard label="Basket uplift" value={fmtEur(r.revenue.basket)} accent />
              <MetricCard label="Retention value" value={fmtEur(r.revenue.retention)} accent />
              <MetricCard label="Referral value" value={fmtEur(r.revenue.referral)} accent />
            </div>
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>{r.revenue.source === "measured" ? "Measured incremental" : "Total incremental"}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 600, fontSize: "1rem", color: "var(--gl)" }}>{fmtEur(r.revenue.total)}</span>
            </div>
          </OutCard>

          <OutCard title="Cost Summary & Breakeven">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <MetricCard label="Total programme cost" value={fmtEur(r.costs.total)} />
              <MetricCard label="Cost per active member" value={fmtEur(r.costs.perActiveMember)} />
              <MetricCard label="Points / rewards cost" value={fmtEur(r.costs.points)} />
              <MetricCard label="Cost as % of total revenue" value={fmtPct(r.costs.asPctOfTotalRevenue)} />
            </div>
            <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px]" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>Breakeven</span>
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>{breakevenDisplay}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--paper)" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${breakevenFill}%`, background: "var(--gl)" }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>
                <span>0</span><span>36 months</span>
              </div>
            </div>
          </OutCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
        {[["↺ Reset defaults", reset], ["Copy results", copyResults], ["Share URL", shareUrl], ["Print / PDF", () => window.print()]].map(([label, fn]) => (
          <button key={label as string} onClick={fn as () => void}
            className="text-[11px] tracking-[0.08em] uppercase px-3 py-1.5 rounded border transition-colors"
            style={{ fontFamily: "Syne, sans-serif", borderColor: "var(--border)", color: "var(--ink)", background: "none" }}>{label as string}</button>
        ))}
        {copied && <span className="text-[11px]" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>Copied ✓</span>}
      </div>

      <details open={defsOpen} onToggle={(e) => setDefsOpen((e.target as HTMLDetailsElement).open)} className="border-t" style={{ borderColor: "var(--border)" }}>
        <summary className="px-5 py-3 cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)", listStyle: "none" }}>
          <span>Definitions & methodology</span>
          <span style={{ color: "var(--muted)" }}>{defsOpen ? "−" : "+"}</span>
        </summary>
        <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {[
            { term: "Required Lift", def: "The minimum percentage increase in active member revenue needed to cover all programme costs. Calculated as Total Cost ÷ Base Revenue × 100. This is the most useful number for a business case — it doesn't require uplift assumptions, only cost data." },
            { term: "Revenue Multiple", def: "Incremental Revenue ÷ Total Cost. Answers: 'For every €1 we invest, how many euros come back?' A multiple of 2.5 means €2.50 returned per €1 spent." },
            { term: "Standard ROI", def: "(Incremental Revenue − Total Cost) ÷ Total Cost × 100. The standard investment return formula. Use this when comparing the programme to other investment options." },
            { term: "Margin ROI", def: "(Incremental Revenue × Gross Margin% − Total Cost) ÷ Total Cost × 100. More conservative than Standard ROI — accounts for the fact that not all incremental revenue is profit." },
            { term: "Active Members", def: "Members who made at least one transaction in the past 12 months. Industry average is 25–40% of enrolled base." },
            { term: "Breakeven", def: "Months until cumulative incremental revenue equals total annual programme cost. Values above 36 months are flagged." },
            { term: "Benchmarks", def: `ROI benchmark range (${ROI_BENCHMARK.low}–${ROI_BENCHMARK.high}%) and industry uplift range (${INDUSTRY_UPLIFT_RANGE.low}–${INDUSTRY_UPLIFT_RANGE.high}%) are based on EMEA loyalty programme data, 2019–2024.` },
            { term: "Incremental Revenue", def: "Revenue attributable to the programme above what would have occurred without it. In estimation mode, derived from uplift assumptions. In measurement mode, entered directly from test/control data." },
          ].map(({ term, def }) => (
            <div key={term}>
              <div className="text-[12px] font-semibold mb-1" style={{ color: "var(--ink)", fontFamily: "Syne, sans-serif" }}>{term}</div>
              <p>{def}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="px-5 py-5 border-t" style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
        <div className="text-[11px] tracking-[0.1em] uppercase mb-2" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>Help me improve</div>
        {feedbackSent ? (
          <p className="text-[13px]" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>Thank you — feedback received.</p>
        ) : (
          <div className="flex gap-2 items-start">
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder="Found an error? Missing a metric? Tell me." rows={2}
              className="flex-1 text-[12px] bg-white border rounded px-3 py-2 focus:outline-none resize-none"
              style={{ borderColor: "var(--border)", color: "var(--ink)", fontFamily: "Inter, sans-serif" }} />
            <button onClick={submitFeedback} disabled={!feedback.trim()}
              className="text-[11px] tracking-[0.08em] uppercase px-3 py-2 rounded border disabled:opacity-40 transition-colors"
              style={{ fontFamily: "Syne, sans-serif", background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>Send</button>
          </div>
        )}
      </div>

      <style>{`
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF7D;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF7D;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
@media print { input[type="range"], textarea, button { display: none !important; } details > div { display: block !important; } body { background: white; } }
      `}</style>
    </div>
  )
}
