"use client"

import { useState, useMemo, useEffect, useLayoutEffect, useCallback, useRef, useId } from "react"
import { createPortal } from "react-dom"
import {
  calculate,
  DEFAULT_INPUTS,
  SELF_SELECTION_RANGE,
  type RoiInputs,
  type RoiScenario,
} from "@/lib/roi-calculations"

const PARAM_KEYS: Record<keyof RoiInputs, string> = {
  totalMembers: "m", activePct: "ap", avgSpend: "sp", pointsCostPct: "pc",
  techCost: "tc", opsCost: "oc", mktCost: "mc", freqUplift: "fu",
  basketUplift: "bu", retentionUplift: "ru", referralRate: "rr",
  selfSelectionPct: "sel", grossMarginPct: "gm", measuredIncremental: "mi",
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
const fmtBreakeven = (months: number) => months > 36 ? "36+ months" : (Math.round(months * 10) / 10).toFixed(1) + " months"

const TOOLTIP_MARGIN = 8

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const pointerType = useRef("")
  const id = useId()

  // Position in viewport coordinates, clamped so the tooltip never leaves the screen
  const place = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const width = Math.min(240, vw - 2 * TOOLTIP_MARGIN)
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, TOOLTIP_MARGIN), vw - width - TOOLTIP_MARGIN)
    const height = tipRef.current?.offsetHeight ?? 0
    const below = rect.bottom + 2
    const above = rect.top - height - 2
    const top = below + height > window.innerHeight - TOOLTIP_MARGIN && above > TOOLTIP_MARGIN ? above : below
    setPos({ left, top, width })
  }, [])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
    }
  }, [open, place])

  return (
    <>
      <button ref={btnRef} type="button" aria-label="More information" aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="relative inline-flex align-middle items-center justify-center w-11 h-11 -my-[15px] -mr-[15px] -ml-[11px] cursor-pointer"
        style={{ background: "none", touchAction: "manipulation" }}
        onPointerDown={(e) => { pointerType.current = e.pointerType }}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true) }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false) }}
        onClick={() => {
          // A mouse has already opened it on hover; touch and keyboard toggle
          if (pointerType.current === "mouse") setOpen(true)
          else setOpen((v) => !v)
          pointerType.current = ""
        }}>
        <span aria-hidden="true"
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-semibold select-none"
          style={{ background: "rgba(10,10,8,0.1)", color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>?</span>
      </button>
      {open && createPortal(
        <span ref={tipRef} id={id} role="tooltip"
          className="fixed z-[60] text-[12px] leading-snug rounded px-2.5 py-2 pointer-events-none"
          style={{
            left: pos?.left ?? 0, top: pos?.top ?? 0, width: pos?.width ?? 240,
            visibility: pos ? "visible" : "hidden",
            background: "#0A0A08", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 400,
          }}>{text}</span>,
        document.body,
      )}
    </>
  )
}

// Keeps the "?" on the same line as the last word of the label
function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  const cut = label.lastIndexOf(" ") + 1
  return (
    <span className="min-w-0 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
      {label.slice(0, cut)}<span className="whitespace-nowrap">{label.slice(cut)}<Tooltip text={tooltip} /></span>
    </span>
  )
}

interface NumberFieldProps {
  label: string; value: number | undefined; min: number; max?: number
  placeholder?: string; allowEmpty?: boolean; onChange: (v: number | undefined) => void
}

function NumberField({ label, value, min, max = Infinity, placeholder, allowEmpty, onChange }: NumberFieldProps) {
  // Raw text while editing; formatted (e.g. 5,000,000) otherwise
  const [draft, setDraft] = useState<string | null>(null)
  const parse = (raw: string) => { const n = parseFloat(raw.replace(/,/g, "")); return isNaN(n) ? undefined : n }
  const display = draft ?? (value === undefined ? "" : value.toLocaleString("en-GB", { maximumFractionDigits: 2 }))
  return (
    <input type="text" inputMode="decimal" aria-label={label} placeholder={placeholder} value={display}
      onFocus={() => setDraft(value === undefined ? "" : String(value))}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const n = parse(raw)
        if (raw.trim() === "" && allowEmpty) onChange(undefined)
        else if (n !== undefined && n >= min && n <= max) onChange(n)
      }}
      onBlur={() => {
        const n = parse(draft ?? "")
        if (n !== undefined) onChange(Math.min(max, Math.max(min, n)))
        setDraft(null)
      }}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
      className="text-right text-[16px] font-semibold w-[7.5rem] min-h-[44px] flex-shrink-0 bg-transparent border-b focus:outline-none"
      style={{ color: "var(--green)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }} />
  )
}

interface SliderInputProps {
  label: string; tooltip: string; value: number; min: number; max: number
  step: number; prefix?: string; suffix?: string; onChange: (v: number) => void
}

function SliderInput({ label, tooltip, value, min, max, step, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between gap-3">
        <LabelWithTooltip label={label} tooltip={tooltip} />
        <NumberField label={label} value={value} min={min} max={max} onChange={(v) => { if (v !== undefined) onChange(v) }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="roi-range w-full cursor-pointer"
        style={{ "--pct": `${Math.min(100, Math.max(0, pct))}%` } as React.CSSProperties}
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

  const r = result
  const measured = r.revenue.source === "measured"
  const rep = r.reported
  const adj = r.adjusted

  const copyResults = () => {
    const pad = (s: string) => s.padEnd(24)
    const row = (label: string, a: string, b: string) => measured ? `${pad(label)}${a}` : `${pad(label)}${a.padEnd(22)}${b}`
    const text = `LOYALTY PROGRAMME ROI SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Required lift to break even:  ${fmtPct(r.requiredLift.pct)} of member base revenue
                               = ${fmtEur(r.requiredLift.perMember)} per active member/year

${measured ? row("", "Measured — no adjustment needed", "") : row("", "As usually reported", "After self-selection")}
${row("Incremental revenue:", fmtEur(rep.revenue.total) + "/year", fmtEur(adj.revenue.total) + "/year")}
${row("Revenue Multiple:", fmtMultiple(rep.roi.revenueMultiple), fmtMultiple(adj.roi.revenueMultiple))}
${row("Standard ROI:", Math.round(rep.roi.standardRoi) + "%", Math.round(adj.roi.standardRoi) + "%")}${rep.roi.marginRoi !== undefined && adj.roi.marginRoi !== undefined ? `\n${row("Margin ROI:", Math.round(rep.roi.marginRoi) + "%", Math.round(adj.roi.marginRoi) + "%")}` : ""}
${row("Breakeven:", fmtBreakeven(rep.breakevenMonths), fmtBreakeven(adj.breakevenMonths))}

Total programme cost: ${fmtEur(r.costs.total)}/year
${measured ? "" : `
Revenue breakdown (as usually reported → after self-selection):
  Frequency uplift:  ${fmtEur(rep.revenue.frequency)} → ${fmtEur(adj.revenue.frequency)}
  Basket uplift:     ${fmtEur(rep.revenue.basket)} → ${fmtEur(adj.revenue.basket)}
  Retention value:   ${fmtEur(rep.revenue.retention)} → ${fmtEur(adj.revenue.retention)}
  Referral value:    ${fmtEur(rep.revenue.referral)} (not adjusted)
`}
Assumptions: ${inputs.totalMembers.toLocaleString("en-GB")} members · ${inputs.activePct}% active · ${fmtEur(inputs.avgSpend)} avg spend/year${measured ? "" : ` · ${r.selfSelection.pct}% would have happened anyway`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source: adamnowak.online/tools/loyalty-roi-calculator`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const scrollToResults = () => {
    document.getElementById("calc-outputs")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const submitFeedback = async () => {
    if (!feedback.trim()) return
    try {
      await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: feedback }) })
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "feedback_form_submit",
          form_location: "roi_calculator"
        });
      }
    } catch (_) {}
    setFeedbackSent(true)
    setFeedback("")
  }

  const breakevenMonths = adj.breakevenMonths
  const breakevenFill = Math.min((breakevenMonths / 36) * 100, 100)
  const liftRiskLabel = { low: "Low bar to clear", moderate: "Needs a well-run programme", high: "Needs strong evidence of uplift" }[r.requiredLift.risk]
  const liftRiskColor = { low: "var(--gl)", moderate: "#d97706", high: "#dc2626" }[r.requiredLift.risk]

  const roiColumns: { title: string; s: RoiScenario; highlight: boolean }[] = measured
    ? [{ title: "Measured", s: rep, highlight: false }]
    : [
        { title: "As usually reported", s: rep, highlight: false },
        { title: "After self-selection", s: adj, highlight: true },
      ]
  const roiRows: { label: string; desc: string; value: (s: RoiScenario) => string }[] = [
    { label: "Incremental revenue", desc: "Per year", value: (s) => fmtEur(s.revenue.total) },
    { label: "Revenue Multiple", desc: "Every €1 invested returns...", value: (s) => fmtMultiple(s.roi.revenueMultiple) },
    { label: "Standard ROI", desc: "(Incremental − Cost) / Cost", value: (s) => Math.round(s.roi.standardRoi) + "%" },
    ...(r.roi.marginRoi !== undefined
      ? [{ label: "Margin ROI", desc: `(Incremental × ${inputs.grossMarginPct}% margin − Cost) / Cost`, value: (s: RoiScenario) => Math.round(s.roi.marginRoi ?? 0) + "%" }]
      : []),
    { label: "Breakeven", desc: "Months to recover annual cost", value: (s) => fmtBreakeven(s.breakevenMonths) },
  ]
  const roiGrid = measured ? "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_8rem]" : "grid-cols-2 sm:grid-cols-[minmax(0,1fr)_8rem_8rem]"
  const adjustedSub = (value: number) => measured ? undefined : `${fmtEur(value)} after self-selection`

  const buttonClass = "min-h-[44px] text-[11px] tracking-[0.08em] uppercase px-3 py-2 rounded border transition-colors"

  return (
    <div style={{ "--ink": "#0A0A08", "--paper": "#EFEFEB", "--green": "#1E4530", "--gl": "#4CAF7D", "--muted": "#6b6b68", "--border": "rgba(10,10,8,0.12)", "--card": "#ffffff", fontFamily: "Inter, sans-serif", color: "var(--ink)" } as React.CSSProperties}>
      <details open={howToOpen} onToggle={(e) => setHowToOpen((e.target as HTMLDetailsElement).open)}
        className="mb-4 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <summary className="px-4 py-3 min-h-[44px] cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
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
          <p><strong style={{ color: "var(--ink)" }}>4. Compare the two ROI columns.</strong> The first is how vendors and most business cases report it. The second removes customers who would have bought anyway.</p>
          <p><strong style={{ color: "var(--ink)" }}>Share your scenario</strong> using the Share URL button — all inputs are encoded in the link.</p>
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div id="calc-inputs" className="p-5 lg:border-r" style={{ borderColor: "var(--border)" }}>
          <SectionTitle>Programme Size</SectionTitle>
          <SliderInput label="Total enrolled members" tooltip="Total database size — enrolled but not necessarily active" value={inputs.totalMembers} min={1000} max={5000000} step={1000} prefix="  " onChange={set("totalMembers")} />
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
          <SliderInput label="Would have happened anyway" tooltip="Members who joined were often your best customers already. What share of the member vs non-member gap would exist without the programme? There is no universal figure — use your own judgement, or measure it with a holdout." value={inputs.selfSelectionPct} min={SELF_SELECTION_RANGE.min} max={SELF_SELECTION_RANGE.max} step={5} suffix="%" onChange={set("selfSelectionPct")} />
          <div className="mt-5 mb-1"><SectionTitle>Optional</SectionTitle></div>
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <LabelWithTooltip label="Gross margin %" tooltip="Unlocks Margin ROI — enter your product/service gross margin to see profit-adjusted return" />
              <NumberField label="Gross margin %" placeholder="e.g. 40" value={inputs.grossMarginPct} min={1} max={100} allowEmpty
                onChange={(v) => setInputs((p) => ({ ...p, grossMarginPct: v }))} />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <LabelWithTooltip label="Measured incremental revenue" tooltip="If you have test/control data, enter your measured incremental revenue here — overrides uplift assumptions" />
              <NumberField label="Measured incremental revenue" placeholder="€" value={inputs.measuredIncremental} min={0} allowEmpty
                onChange={(v) => setInputs((p) => ({ ...p, measuredIncremental: v }))} />
            </div>
            {measured && <p className="text-[10px] mt-1" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>✓ Using measured data — uplift assumptions ignored</p>}
          </div>
        </div>

        <div id="calc-outputs" className="p-5 scroll-mt-[72px]" style={{ background: "#fafaf8" }}>
          <div className="print-header" style={{ display: "none" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "10px", color: "#6b6b68", marginBottom: "4px" }}>
              adamnowak.online/tools/loyalty-roi-calculator
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "20px", color: "#0A0A08" }}>
              Loyalty Programme ROI Calculator
            </div>
            <div style={{ fontSize: "10px", color: "#6b6b68", marginTop: "2px" }}>
              {new Date().toLocaleDateString("en-GB")}
            </div>
          </div>

          <div className="rounded-lg p-5 mb-3" style={{ background: "var(--green)" }}>
            <div className="text-[10px] tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Syne, sans-serif" }}>Required lift to break even</div>
            <div className="leading-none mb-1" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "3.2rem", color: "#fff" }}>{fmtPct(r.requiredLift.pct)}</div>
            <div className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>of active member base revenue<span className="mx-2 opacity-40">·</span>{fmtEur(r.requiredLift.perMember)} per member/year</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "Syne, sans-serif" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: liftRiskColor }} />{liftRiskLabel}
            </div>
          </div>

          <OutCard title="Return on Investment">
            {/* Phone: metric label above the value columns. ≥640px: label | value | value */}
            <div role="table" aria-label="Return on investment">
              <div role="row" className={`grid ${roiGrid} gap-x-2 pb-2`}>
                <span role="columnheader" className="sr-only sm:not-sr-only">
                  <span className="sr-only">Metric</span>
                </span>
                {roiColumns.map((c) => (
                  <span key={c.title} role="columnheader" className="px-3 sm:text-right text-[10px] tracking-[0.08em] uppercase font-semibold leading-tight"
                    style={{ fontFamily: "Syne, sans-serif", color: c.highlight ? "var(--green)" : "var(--muted)" }}>{c.title.replace("self-selection", "")}{c.title.includes("self-selection") && <span className="whitespace-nowrap">self-selection</span>}</span>
                ))}
              </div>
              <div className="space-y-1.5">
                {roiRows.map((row) => (
                  <div key={row.label} role="row" className={`grid ${roiGrid} rounded-md overflow-hidden`} style={{ background: "var(--paper)" }}>
                    <div role="rowheader" className={`${roiColumns.length === 2 ? "col-span-2" : ""} sm:col-span-1 px-3 pt-3 pb-1 sm:pb-3`}>
                      <div className="text-[11px] font-medium mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>{row.label}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{row.desc}</div>
                    </div>
                    {roiColumns.map((c) => (
                      <div key={c.title} role="cell" className="px-3 pt-1 pb-3 sm:pt-3 sm:text-right"
                        style={{ background: c.highlight ? "rgba(76,175,125,0.14)" : undefined, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "0.95rem", color: "var(--ink)", overflowWrap: "anywhere" }}>
                        {row.value(c.s)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>
              {measured
                ? "Measured — no adjustment needed"
                : "The gap between these two columns is the part of the business case that a control group would test."}
            </p>
            {r.roi.marginRoi === undefined && (
              <div className="mt-3 text-[11px] px-3 py-2 rounded-md" style={{ color: "var(--muted)", background: "var(--paper)", fontFamily: "Syne, sans-serif" }}>Enter gross margin % in Optional inputs to unlock Margin ROI</div>
            )}
          </OutCard>

          <OutCard title="Revenue Impact">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <MetricCard label="Frequency uplift" value={fmtEur(rep.revenue.frequency)} sub={adjustedSub(adj.revenue.frequency)} accent />
              <MetricCard label="Basket uplift" value={fmtEur(rep.revenue.basket)} sub={adjustedSub(adj.revenue.basket)} accent />
              <MetricCard label="Retention value" value={fmtEur(rep.revenue.retention)} sub={adjustedSub(adj.revenue.retention)} accent />
              <MetricCard label="Referral value" value={fmtEur(rep.revenue.referral)} sub={measured ? undefined : "Not adjusted"} accent />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>{measured ? "Measured incremental" : "Total incremental — as usually reported"}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 600, fontSize: "1rem", color: "var(--gl)" }}>{fmtEur(rep.revenue.total)}</span>
            </div>
            {!measured && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>After self-selection</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: 600, fontSize: "1rem", color: "var(--green)" }}>{fmtEur(adj.revenue.total)}</span>
              </div>
            )}
          </OutCard>

          <OutCard title="Cost Summary & Breakeven">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <MetricCard label="Total programme cost" value={fmtEur(r.costs.total)} />
              <MetricCard label="Cost per active member" value={fmtEur(r.costs.perActiveMember)} />
              <MetricCard label="Points / rewards cost" value={fmtEur(r.costs.points)} />
              <MetricCard label="Cost as % of total revenue" value={fmtPct(r.costs.asPctOfTotalRevenue)} />
            </div>
            <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px]" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>{measured ? "Breakeven" : "Breakeven — after self-selection"}</span>
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)" }}>{fmtBreakeven(breakevenMonths)}</span>
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

      <div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center px-5 py-3 border-t" style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
          {[["↺ Reset defaults", reset], ["Copy results", copyResults], ["Share URL", shareUrl], ["Print / PDF", () => window.print()]].map(([label, fn]) => (
            <button key={label as string} type="button" onClick={fn as () => void}
              className={buttonClass}
              style={{ fontFamily: "Syne, sans-serif", borderColor: "var(--border)", color: "var(--ink)", background: "none" }}>{label as string}</button>
          ))}
          {copied && <span className="col-span-2 text-[11px]" role="status" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>Copied ✓</span>}
        </div>

        <details open={defsOpen} onToggle={(e) => setDefsOpen((e.target as HTMLDetailsElement).open)} className="border-t" style={{ borderColor: "var(--border)" }}>
          <summary className="px-5 py-3 min-h-[44px] cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
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
              { term: "Self-selection", def: "Customers who join a programme tend to be those who already buy more. Comparing members to non-members credits the programme with behaviour it did not cause. The adjusted figures remove that share." },
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
            <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                placeholder="Found an error? Missing a metric? Tell me." rows={2} aria-label="Feedback"
                className="w-full sm:flex-1 text-[16px] bg-white border rounded px-3 py-2 focus:outline-none resize-none"
                style={{ borderColor: "var(--border)", color: "var(--ink)", fontFamily: "Inter, sans-serif" }} />
              <button type="button" onClick={submitFeedback} disabled={!feedback.trim()}
                className="min-h-[44px] w-full sm:w-auto text-[11px] tracking-[0.08em] uppercase px-4 py-2 rounded border disabled:opacity-40 transition-colors"
                style={{ fontFamily: "Syne, sans-serif", background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>Send</button>
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={scrollToResults}
        className="roi-sticky lg:hidden sticky bottom-0 z-30 w-full grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-5 pt-2.5 text-left min-h-[56px]"
        style={{ background: "var(--green)", color: "#fff", boxShadow: "0 -2px 10px rgba(10,10,8,0.15)", paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.1em] uppercase leading-tight" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Syne, sans-serif" }}>Required lift</span>
          <span className="block leading-none mt-0.5" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.6rem" }}>{fmtPct(r.requiredLift.pct)}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.1em] uppercase leading-tight" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Syne, sans-serif" }}>{measured ? "ROI · measured" : <>ROI · after <span className="whitespace-nowrap">self-selection</span></>}</span>
          <span className="block leading-none mt-0.5" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.6rem" }}>{Math.round(adj.roi.standardRoi)}%</span>
        </span>
        <span aria-hidden="true" className="text-[18px]" style={{ color: "rgba(255,255,255,0.75)" }}>↓</span>
        <span className="sr-only">Show full results</span>
      </button>

      <style>{`
.roi-range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  height: 44px;
  margin: 0;
  background: transparent;
}
.roi-range:focus { outline: none; }
.roi-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #4CAF7D 0%, #4CAF7D var(--pct), rgba(10,10,8,0.12) var(--pct), rgba(10,10,8,0.12) 100%);
}
.roi-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -10px;
  border-radius: 50%;
  background: #4CAF7D;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.roi-range:focus-visible::-webkit-slider-thumb { outline: 2px solid #1E4530; outline-offset: 2px; }
.roi-range::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(10,10,8,0.12);
}
.roi-range::-moz-range-progress {
  height: 4px;
  border-radius: 2px;
  background: #4CAF7D;
}
.roi-range::-moz-range-thumb {
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4CAF7D;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.roi-range:focus-visible::-moz-range-thumb { outline: 2px solid #1E4530; outline-offset: 2px; }
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Hide interactive elements */
  input[type="range"], textarea, button,
  details summary, .lg\\:hidden,
  nav, header { display: none !important; }

  details > div { display: block !important; }

  /* Reset layout */
  .grid { display: block !important; }
  body { font-size: 11px !important; background: white !important; margin: 0; }

  /* Page 1 - Inputs */
  #calc-inputs {
    display: block !important;
    width: 100% !important;
    page-break-after: always;
    padding: 20px !important;
  }

  /* Page 2 - Outputs */
  #calc-outputs {
    display: block !important;
    width: 100% !important;
    background: white !important;
    padding: 20px !important;
  }

  /* Compact spacing */
  .mb-4 { margin-bottom: 6px !important; }
  .mb-3 { margin-bottom: 6px !important; }
  .p-4 { padding: 8px !important; }
  .p-5 { padding: 12px !important; }
  .p-3 { padding: 6px !important; }

  /* Cards */
  [class*="rounded-lg border"] { break-inside: avoid; margin-bottom: 8px !important; }
  [class*="rounded-md"] { padding: 6px 8px !important; }

  /* Grid 2 cols stays 2 cols */
  .grid-cols-2 { display: grid !important; grid-template-columns: 1fr 1fr; gap: 6px !important; }

  /* Print header visible */
  .print-header { display: block !important; margin-bottom: 16px !important; }
}
      `}</style>
    </div>
  )
}
