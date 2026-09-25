"use client"

import { useState, useMemo, useEffect, useLayoutEffect, useCallback, useDeferredValue, useRef, useId } from "react"
import { createPortal } from "react-dom"
import {
  analysisPopulation,
  approxBasket,
  approximateCustomers,
  detectExtremes,
  enforceIncreasing,
  logHistogram,
  niceRound,
  planTiers,
  quantileSorted,
  sampleCustomers,
  sortAscending,
  suggestThresholds,
  thresholdChange,
  tierOf,
  APPROX_SAMPLE_SIZE,
  DEFAULT_APPROX,
  DEFAULT_BENEFITS,
  DEFAULT_NAMES,
  MAX_TIERS,
  SAMPLE_CORPORATE,
  SAMPLE_SIZE,
  TOP20_RANGE,
  type ApproxInputs,
  type Benefit,
  type BenefitType,
  type Customer,
  type PlannerResult,
  type ThresholdChange,
} from "@/lib/tier-calculations"
import {
  checkCsvFile,
  csvSampleSentence,
  csvSummarySentence,
  parseCustomerCsv,
  CSV_FEW_ROWS,
  CSV_ROW_LIMIT,
  CSV_TEMPLATE_URL,
  type CsvFailure,
  type CsvSuccess,
} from "@/lib/tier-csv"
import { buildTierBotContext, distributionSummary, type TierBotSource } from "@/lib/tier-bot-context"
import { TierPlannerChat } from "./TierPlannerChat"

// ─────────────────────────────────────────────────────────────
// State and URL
// ─────────────────────────────────────────────────────────────

type Source = "approx" | "sample" | "csv"

interface PlannerState {
  source: Source
  approx: ApproxInputs
  marginPct: number
  tierCount: number
  thresholds: number[]
  windowMonths: 12 | 24 | 36
  validityYears: 1 | 2 | 3
  benefits: Benefit[]
  softLanding: boolean
  activityKeep: boolean
  excludeExtremes: boolean
  names: string[]
  current: number[] | null
}

const DEFAULT_TIER_COUNT = 2

const BOT_SOURCES: Record<Source, TierBotSource> = { approx: "approximation", sample: "sample", csv: "csv" }

/** Path C: customers from the uploaded file, kept in memory only (never in the URL). */
type CsvData = CsvSuccess & { fileName: string }

function customersFor(source: Source, approx: ApproxInputs, csv: CsvData | null = null): Customer[] {
  if (source === "csv") return csv?.customers ?? []
  return source === "sample" ? sampleCustomers() : approximateCustomers(approx)
}

const DEFAULT_STATE: PlannerState = {
  source: "approx",
  approx: DEFAULT_APPROX,
  marginPct: 40,
  tierCount: DEFAULT_TIER_COUNT,
  thresholds: suggestThresholds(customersFor("approx", DEFAULT_APPROX), DEFAULT_TIER_COUNT),
  windowMonths: 12,
  validityYears: 1,
  benefits: DEFAULT_BENEFITS,
  softLanding: true,
  activityKeep: false,
  excludeExtremes: false,
  names: DEFAULT_NAMES,
  current: null,
}

const BENEFIT_CODES: Record<BenefitType, string> = { discount: "d", operational: "o", recognition: "r" }
const CODE_BENEFITS: Record<string, BenefitType> = { d: "discount", o: "operational", r: "recognition" }

function stateToParams(s: PlannerState): URLSearchParams {
  const p = new URLSearchParams()
  // Uploaded data never goes into the link: only the programme settings do
  p.set("d", s.source === "sample" ? "s" : s.source === "csv" ? "c" : "a")
  if (s.source === "approx") {
    p.set("n", String(s.approx.customers))
    p.set("md", String(s.approx.medianSpend))
    p.set("t20", String(s.approx.top20SharePct))
    p.set("pf", String(s.approx.purchasesPerYear))
  }
  p.set("gm", String(s.marginPct))
  p.set("k", String(s.tierCount))
  p.set("t", s.thresholds.join(","))
  p.set("w", String(s.windowMonths))
  p.set("v", String(s.validityYears))
  p.set("b", s.benefits.slice(0, s.tierCount).map((b) => BENEFIT_CODES[b.type] + b.value).join(","))
  p.set("sl", s.softLanding ? "1" : "0")
  p.set("ak", s.activityKeep ? "1" : "0")
  p.set("ex", s.excludeExtremes ? "1" : "0")
  s.names.forEach((name, i) => { if (name !== DEFAULT_NAMES[i]) p.set(`nm${i}`, name) })
  if (s.current) p.set("cp", s.current.join(","))
  return p
}

function paramsToState(p: URLSearchParams): PlannerState {
  const num = (key: string, fallback: number, min = -Infinity, max = Infinity) => {
    const raw = p.get(key)
    const n = raw === null || raw === "" ? NaN : Number(raw)
    return isNaN(n) ? fallback : Math.min(max, Math.max(min, n))
  }
  const list = (key: string) => (p.get(key) ?? "").split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
  const pick = <T extends number>(v: number, allowed: T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback)

  const source: Source = p.get("d") === "s" ? "sample" : p.get("d") === "c" ? "csv" : "approx"
  const approx: ApproxInputs = {
    customers: num("n", DEFAULT_APPROX.customers, 100, 100_000_000),
    medianSpend: num("md", DEFAULT_APPROX.medianSpend, 1, 1_000_000),
    top20SharePct: num("t20", DEFAULT_APPROX.top20SharePct, TOP20_RANGE.min, TOP20_RANGE.max),
    purchasesPerYear: num("pf", DEFAULT_APPROX.purchasesPerYear, 0.1, 1_000),
  }
  const tierCount = Math.round(num("k", DEFAULT_TIER_COUNT, 1, MAX_TIERS))
  // A CSV link carries no data: fall back to the default approximation for any missing threshold
  const suggested = suggestThresholds(customersFor(source === "csv" ? "approx" : source, approx), tierCount)
  const given = list("t")
  const thresholds = enforceIncreasing(suggested.map((v, i) => given[i] ?? v), 0)

  const benefits = DEFAULT_BENEFITS.map((fallback, i) => {
    const raw = (p.get("b") ?? "").split(",")[i]
    const type = raw ? CODE_BENEFITS[raw[0]] : undefined
    const value = raw ? Number(raw.slice(1)) : NaN
    return type && !isNaN(value) && value >= 0 ? { type, value } : fallback
  })
  const names = DEFAULT_NAMES.map((fallback, i) => (p.get(`nm${i}`) ?? "").slice(0, 24) || fallback)
  const current = list("cp")

  return {
    source,
    approx,
    marginPct: num("gm", DEFAULT_STATE.marginPct, 1, 100),
    tierCount,
    thresholds,
    windowMonths: pick(num("w", 12), [12, 24, 36], 12),
    validityYears: pick(num("v", 1), [1, 2, 3], 1),
    benefits,
    softLanding: p.get("sl") !== "0",
    activityKeep: p.get("ak") === "1",
    excludeExtremes: p.get("ex") === "1",
    names,
    current: current.length ? enforceIncreasing(current.slice(0, MAX_TIERS), 0) : null,
  }
}

// ─────────────────────────────────────────────────────────────
// Formatting and sentence templates
// ─────────────────────────────────────────────────────────────

const fmtEur = (n: number) => "€" + Math.round(n).toLocaleString("en-GB")
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-GB")
const fmtShare = (share: number, decimals = 1) => (share * 100).toFixed(decimals) + "%"
const plural = (n: number, word: string) => `${fmtInt(n)} ${word}${Math.round(n) === 1 ? "" : "s"}`
const fmtAxis = (v: number) =>
  v >= 1_000_000 ? `€${+(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `€${+(v / 1_000).toFixed(1)}k` : `€${+v.toFixed(0)}`

function purchasesToday(n: number): string {
  return n < 1 ? "fewer than one" : fmtInt(n)
}

function reachSentence(from: string, to: string, extra: number, current: number): string {
  if (extra <= 0) return `A typical ${from} member already spends what ${to} requires.`
  return `A typical ${from} member would need ${plural(extra, "more purchase")} a year to reach ${to}. Today they make ${purchasesToday(current)}.`
}

function windowSentence(from: string, to: string, months: number, windowMonths: number): string {
  const time = months > 120 ? "more than ten years" : `about ${plural(Math.max(1, months), "month")}`
  return `At today's pace, a typical ${from} member would spend what ${to} requires in ${time}. The qualification window is ${windowMonths} months.`
}

const BENEFIT_LABELS: Record<BenefitType, string> = {
  discount: "Discount",
  operational: "Operational",
  recognition: "Recognition",
}

function benefitLabel(b: Benefit): string {
  return b.type === "discount" ? `${b.value}% discount` : `${BENEFIT_LABELS[b.type].toLowerCase()}, ${fmtEur(b.value)} per member a year`
}

const ACTIVITY_SENTENCE = "Activity that keeps status has to cost the customer some effort. A login alone can cheapen the status for those who earned it."
const WINDOW_SENTENCE = "Counting spend over a longer window needs several years of customer data. Tier shares here use one year of spend."
const EXTREME_RULE = "Extreme customers: annual spend above Q3 + 3 × IQR, measured on the log of spend."
const APPROX_LABEL = "Approximation from four numbers. Real data often has a longer tail."
const BASKET_SENTENCE = "Every customer is assumed to buy the same typical basket (median spend ÷ purchases a year), so purchases rise in step with spend."

// ─────────────────────────────────────────────────────────────
// UI primitives (same look as the ROI calculator)
// ─────────────────────────────────────────────────────────────

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
function LabelWithTooltip({ label, tooltip }: { label: string; tooltip?: string }) {
  if (!tooltip) return <span className="min-w-0 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>{label}</span>
  const cut = label.lastIndexOf(" ") + 1
  return (
    <span className="min-w-0 text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
      {label.slice(0, cut)}<span className="whitespace-nowrap">{label.slice(cut)}<Tooltip text={tooltip} /></span>
    </span>
  )
}

interface NumberFieldProps {
  label: string; value: number; min: number; max?: number; prefix?: string; suffix?: string
  onChange: (v: number) => void
}

function NumberField({ label, value, min, max = Infinity, prefix, suffix, onChange }: NumberFieldProps) {
  // Raw text while editing; formatted (e.g. 5,000,000) otherwise
  const [draft, setDraft] = useState<string | null>(null)
  const parse = (raw: string) => { const n = parseFloat(raw.replace(/[,€%\s]/g, "")); return isNaN(n) ? undefined : n }
  const display = draft ?? (prefix ?? "") + value.toLocaleString("en-GB", { maximumFractionDigits: 2 }) + (suffix ?? "")
  return (
    <input type="text" inputMode="decimal" aria-label={label} value={display}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const n = parse(raw)
        if (n !== undefined && n >= min && n <= max) onChange(n)
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

function FieldRow({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <LabelWithTooltip label={label} tooltip={tooltip} />
      {children}
    </div>
  )
}

interface RangeProps {
  label: string; tooltip: string; value: number; min: number; max: number; step: number
  suffix?: string; onChange: (v: number) => void
}

function SliderInput({ label, tooltip, value, min, max, step, suffix, onChange }: RangeProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-2">
      <FieldRow label={label} tooltip={tooltip}>
        <NumberField label={label} value={value} min={min} max={max} suffix={suffix} onChange={onChange} />
      </FieldRow>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="tp-range w-full cursor-pointer"
        style={{ "--pct": `${Math.min(100, Math.max(0, pct))}%` } as React.CSSProperties}
        aria-label={label} />
    </div>
  )
}

const LOG_STEPS = 1000

/** Threshold slider on a log scale, so it moves evenly across the chart. */
function ThresholdSlider({ label, tooltip, value, min, max, onChange }: Omit<RangeProps, "step" | "suffix">) {
  const lmin = Math.log(min)
  const span = Math.log(max) - lmin || 1
  const pos = Math.round(Math.min(1, Math.max(0, (Math.log(value) - lmin) / span)) * LOG_STEPS)
  return (
    <div className="mb-1">
      <FieldRow label={label} tooltip={tooltip}>
        <NumberField label={label} value={value} min={1} max={10_000_000} prefix="€" onChange={onChange} />
      </FieldRow>
      <input type="range" min={0} max={LOG_STEPS} step={1} value={pos}
        onChange={(e) => onChange(niceRound(Math.exp(lmin + (parseFloat(e.target.value) / LOG_STEPS) * span)))}
        className="tp-range w-full cursor-pointer"
        style={{ "--pct": `${(pos / LOG_STEPS) * 100}%` } as React.CSSProperties}
        aria-label={label} aria-valuetext={fmtEur(value)} />
    </div>
  )
}

function Segmented<T extends string | number>({ label, options, value, onChange, fitLabels = false }: {
  label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void
  /** Columns sized to their labels instead of equal widths, so a longer label wraps less on narrow screens */
  fitLabels?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-md p-1"
      style={{ gridTemplateColumns: fitLabels ? `repeat(${options.length}, auto)` : `repeat(${options.length}, minmax(0, 1fr))`, background: "var(--paper)" }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button key={String(o.value)} type="button" role="radio" aria-checked={active} onClick={() => onChange(o.value)}
            className="min-h-[44px] px-1 rounded text-[12px] leading-tight transition-colors"
            style={{
              fontFamily: "Syne, sans-serif",
              background: active ? "var(--card)" : "transparent",
              color: active ? "var(--green)" : "var(--muted)",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "0 1px 2px rgba(10,10,8,0.12)" : "none",
            }}>{o.label}</button>
        )
      })}
    </div>
  )
}

function Toggle({ label, tooltip, checked, onChange, children }: {
  label: string; tooltip?: string; checked: boolean; onChange: (v: boolean) => void; children?: React.ReactNode
}) {
  return (
    <div className="mb-3">
      <FieldRow label={label} tooltip={tooltip}>
        <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
          className="flex-shrink-0 w-[52px] h-[44px] flex items-center justify-end" style={{ background: "none" }}>
          <span className="block w-[44px] h-[26px] rounded-full transition-colors relative"
            style={{ background: checked ? "var(--gl)" : "rgba(10,10,8,0.18)" }}>
            <span className="absolute top-[2px] left-0 w-[22px] h-[22px] rounded-full bg-white transition-transform"
              style={{ transform: `translateX(${checked ? 20 : 2}px)`, boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
          </span>
        </button>
      </FieldRow>
      {children}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-snug mt-1" style={{ color: "var(--muted)" }}>{children}</p>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.14em] uppercase mb-3 pb-2 border-b"
      style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }}>
      {children}
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md p-3 min-w-0" style={{ background: "var(--paper)" }}>
      <div className="text-[11px] mb-0.5" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>{label}</div>
      <div className="font-medium leading-tight" style={{ fontSize: "0.95rem", color: "var(--ink)", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{sub}</div>}
    </div>
  )
}

function OutCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border mb-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-4 py-2.5 border-b text-[10px] tracking-[0.12em] uppercase"
        style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Path C — CSV upload (the file never leaves the browser)
// ─────────────────────────────────────────────────────────────

type CsvStatus =
  | { kind: "idle" }
  | { kind: "loading"; fileName: string; progress: number | null }
  | { kind: "error"; fileName: string; error: CsvFailure }

const PRIVACY_SENTENCE = "Your file is read by your browser only. Nothing is uploaded or stored."

function TemplateLink({ children = "Download the template" }: { children?: React.ReactNode }) {
  return (
    <a href={CSV_TEMPLATE_URL} download="loyalty-tier-planner-template.csv" className="underline font-medium"
      style={{ color: "var(--green)" }}>{children}</a>
  )
}

function CsvUpload({ status, csv, linkWithoutData, onFile }: {
  status: CsvStatus; csv: CsvData | null; linkWithoutData: boolean; onFile: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const loading = status.kind === "loading"
  const pick = () => inputRef.current?.click()

  return (
    <div className="mt-3">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!loading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file && !loading) onFile(file)
        }}
        className="rounded-md border-2 border-dashed px-4 py-4 text-center transition-colors"
        style={{ borderColor: dragging ? "var(--gl)" : "rgba(10,10,8,0.2)", background: dragging ? "rgba(76,175,125,0.08)" : "var(--paper)" }}>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ""
          }} />
        {loading ? (
          <div role="status" className="flex items-center justify-center gap-2.5 min-h-[44px] text-[13px]">
            <span aria-hidden="true" className="tp-spin inline-block w-4 h-4 rounded-full border-2 flex-shrink-0"
              style={{ borderColor: "rgba(10,10,8,0.15)", borderTopColor: "var(--gl)" }} />
            <span className="min-w-0 truncate">
              {status.progress === null ? "Checking rows…" : `Reading ${status.fileName}… ${Math.round(status.progress * 100)}%`}
            </span>
          </div>
        ) : csv ? (
          <div className="flex items-center justify-between gap-3 text-left">
            <span className="min-w-0">
              <span className="block text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>Your file</span>
              <span className="block text-[13px] font-medium truncate">{csv.fileName}</span>
            </span>
            <button type="button" onClick={pick}
              className="min-h-[44px] flex-shrink-0 text-[11px] tracking-[0.08em] uppercase px-3 py-2 rounded border"
              style={{ fontFamily: "Syne, sans-serif", borderColor: "var(--border)", color: "var(--ink)", background: "var(--card)" }}>Replace file</button>
          </div>
        ) : (
          <>
            <button type="button" onClick={pick}
              className="min-h-[44px] w-full sm:w-auto text-[11px] tracking-[0.08em] uppercase px-4 py-2 rounded border"
              style={{ fontFamily: "Syne, sans-serif", background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>Choose a CSV file</button>
            <p className="hidden sm:block text-[12px] mt-2" style={{ color: "var(--muted)" }}>or drag it here</p>
          </>
        )}
      </div>

      <p className="text-[12px] leading-snug mt-2" style={{ color: "var(--muted)" }}>
        Columns: <code>annual_spend</code> and <code>purchases</code>, one row per customer; <code>customer_id</code> is optional and not used. <TemplateLink />.
      </p>
      <p className="text-[12px] leading-snug mt-1" style={{ color: "var(--muted)" }}>{PRIVACY_SENTENCE}</p>

      {status.kind === "error" && (
        <div role="alert" className="mt-3 rounded-md px-3 py-2.5 text-[13px] leading-snug"
          style={{ background: "rgba(176,58,46,0.08)", color: "#8a2c22", border: "1px solid rgba(176,58,46,0.25)" }}>
          <span className="block text-[11px] mb-0.5 truncate" style={{ fontFamily: "Syne, sans-serif" }}>{status.fileName}</span>
          {status.error.message}{" "}
          <TemplateLink />
        </div>
      )}

      {status.kind !== "error" && !csv && linkWithoutData && !loading && (
        <p className="mt-3 rounded-md px-3 py-2.5 text-[12px] leading-snug" style={{ background: "var(--paper)" }}>
          This link keeps the programme settings but not the data. Upload your file to see results with these settings.
        </p>
      )}

      {csv && !loading && status.kind !== "error" && (
        <div role="status" className="mt-3 rounded-md px-3 py-2.5 text-[12px] leading-snug space-y-1.5" style={{ background: "var(--paper)" }}>
          <p className="font-medium" style={{ color: "var(--ink)" }}>{csvSummarySentence(csv)}</p>
          {csv.validRows === 0 ? (
            <p style={{ color: "#8a2c22" }}>None of the rows can be used, so there is nothing to show yet. Check the file against the template.</p>
          ) : csv.validRows < CSV_FEW_ROWS ? (
            <p style={{ color: "#7a5520" }}>Only {plural(csv.validRows, "customer")}. Results from so few customers are unstable: one customer can move a threshold or change a tier&apos;s share.</p>
          ) : null}
          {csv.sampled && <p style={{ color: "#7a5520" }}>{csvSampleSentence(csv)}</p>}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Distribution chart (hand-drawn SVG, log spend axis)
// ─────────────────────────────────────────────────────────────

const TIER_COLOURS = ["#c9d8cf", "#9cc4ad", "#4CAF7D", "#2f7a55", "#1E4530"]
const EXTREME_COLOUR = "#c08a3e"

function DistributionChart({ customers, flags, thresholds, names, excludeExtremes }: {
  customers: Customer[]; flags: boolean[]; thresholds: number[]; names: string[]; excludeExtremes: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sorting and binning depend on the data only, so moving a threshold does not redo them
  const dataRange = useMemo(() => {
    const sorted = sortAscending(customers.map((c) => c.spend).filter((s) => s > 0))
    const anyExtreme = flags.some(Boolean)
    return {
      lo: Math.max(1, quantileSorted(sorted, 0.005)),
      hi: anyExtreme ? sorted[sorted.length - 1] : quantileSorted(sorted, 0.999),
    }
  }, [customers, flags])
  const domain = {
    lo: Math.min(dataRange.lo, thresholds[0] / 1.5),
    hi: Math.max(dataRange.hi, thresholds[thresholds.length - 1] * 1.5),
  }

  const bins = useMemo(() => logHistogram(customers, flags, domain.lo, domain.hi, 48), [customers, flags, domain.lo, domain.hi])
  const height = 200
  const pad = { l: 6, r: 6, t: 40, b: 26 }
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const llo = Math.log(domain.lo)
  const span = Math.log(domain.hi) - llo || 1
  const x = (v: number) => pad.l + ((Math.log(Math.max(v, domain.lo)) - llo) / span) * innerW
  const maxCount = Math.max(1, ...bins.map((b) => b.count + b.extreme))
  const barW = innerW / bins.length
  const y = (n: number) => (n <= 0 ? 0 : Math.max(2, (n / maxCount) * innerH))

  const ticks: number[] = []
  const mults = width < 480 ? [1] : [1, 2, 5]
  for (let k = Math.floor(Math.log10(domain.lo)); k <= Math.ceil(Math.log10(domain.hi)); k++) {
    for (const m of mults) {
      const v = m * 10 ** k
      if (v >= domain.lo && v <= domain.hi) ticks.push(v)
    }
  }
  const extremeCount = flags.filter(Boolean).length

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" className="block"
        aria-label={`Customers by annual spend on a log scale, with ${thresholds.length} tier threshold line${thresholds.length === 1 ? "" : "s"}`}>
        {bins.map((b, i) => {
          const tier = tierOf(Math.sqrt(b.from * b.to), thresholds)
          const hNormal = y(b.count)
          const hExtreme = y(b.extreme)
          const bx = pad.l + i * barW + 0.5
          const bw = Math.max(1, barW - 1)
          return (
            <g key={i}>
              {b.count > 0 && <rect x={bx} y={pad.t + innerH - hNormal} width={bw} height={hNormal} fill={TIER_COLOURS[tier]} />}
              {b.extreme > 0 && <rect x={bx} y={pad.t + innerH - hNormal - hExtreme} width={bw} height={hExtreme}
                fill={EXTREME_COLOUR} opacity={excludeExtremes ? 0.35 : 1} />}
            </g>
          )
        })}
        <line x1={pad.l} x2={width - pad.r} y1={pad.t + innerH} y2={pad.t + innerH} stroke="rgba(10,10,8,0.25)" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={pad.t + innerH} y2={pad.t + innerH + 4} stroke="rgba(10,10,8,0.35)" />
            <text x={Math.min(Math.max(x(v), 14), width - 14)} y={height - 8} fontSize={11} textAnchor="middle" fill="#6b6b68"
              style={{ fontFamily: "Syne, sans-serif" }}>{fmtAxis(v)}</text>
          </g>
        ))}
        {thresholds.map((t, i) => {
          const tx = x(t)
          const anchor = tx > width - 70 ? "end" : tx < 70 ? "start" : "middle"
          const ly = 12 + (i % 2) * 14
          return (
            <g key={i}>
              <line x1={tx} x2={tx} y1={ly + 4} y2={pad.t + innerH} stroke="#0A0A08" strokeWidth={1.25} strokeDasharray="3 3" />
              <text x={anchor === "end" ? tx - 3 : anchor === "start" ? tx + 3 : tx} y={ly} fontSize={11} textAnchor={anchor} fill="#0A0A08"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 600 }}>{names[i + 1]} · {fmtAxis(t)}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px]" style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif" }}>
        <span>Customers by annual spend · log scale</span>
        {extremeCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: EXTREME_COLOUR, opacity: excludeExtremes ? 0.35 : 1 }} />
            Extreme customers{excludeExtremes ? " (excluded)" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Summary text for "Copy summary"
// ─────────────────────────────────────────────────────────────

function buildSummary(s: PlannerState, r: PlannerResult, change: ThresholdChange | null, csv: CsvData | null): string {
  const line = "━".repeat(44)
  const data = s.source === "csv" && csv
    ? `Uploaded CSV file: ${csvSummarySentence(csv)}${csv.sampled ? ` ${csvSampleSentence(csv)}` : ""}`
    : s.source === "sample"
    ? `Sample data (${fmtInt(SAMPLE_SIZE)} fictional customers)`
    : `Approximation from four numbers: ${fmtInt(s.approx.customers)} customers, median ${fmtEur(s.approx.medianSpend)} a year, top 20% = ${s.approx.top20SharePct}% of revenue, ${s.approx.purchasesPerYear} purchases a year`
  const tiers = r.tiers.map((t) => {
    const head = t.index === 0
      ? `${t.name} (below ${fmtEur(r.tiers[1]?.threshold ?? 0)})`
      : `${t.name} (from ${fmtEur(t.threshold)})`
    const lines = [`${head}: ${fmtShare(t.customerShare)} of customers · ${fmtShare(t.revenueShare)} of revenue`]
    if (t.benefit) lines.push(`  Benefit: ${benefitLabel(t.benefit)} → ${fmtEur(t.benefitCost)} a year = ${t.benefitCostPctOfMargin.toFixed(1)}% of the tier's margin`)
    if (t.reach) lines.push(`  ${reachSentence(t.name, r.tiers[t.reach.nextTier].name, t.reach.extraPurchases, t.reach.currentPurchases)}`)
    return lines.join("\n")
  })
  const rules = r.complexity.count
    ? `${r.complexity.count} (${r.complexity.mechanisms.join("; ")})`
    : "0 (spend more, get more)"
  const extra: string[] = []
  if (s.excludeExtremes && r.excluded > 0) {
    extra.push(`Extreme customers excluded: ${fmtInt(r.extremes.count)} (${fmtShare(r.extremes.customerShare)} of customers, ${fmtShare(r.extremes.revenueShare)} of revenue)`)
  }
  if (change && s.current) {
    extra.push(`Change from current programme (${s.current.map(fmtEur).join(" / ")}): ${fmtInt(change.losing)} of ${fmtInt(change.currentMembers)} current members would lose status when their period ends${s.softLanding ? `; soft landing keeps ${fmtInt(change.caughtBySoftLanding)} of them one tier down` : ""}`)
  }
  return `LOYALTY TIER PLANNER SUMMARY
${line}
Data: ${data}
Gross margin ${s.marginPct}% · Qualification window ${s.windowMonths} months · Status validity ${plural(s.validityYears, "year")}

${tiers.join("\n\n")}

Rules to explain to a customer: ${rules}${extra.length ? "\n" + extra.join("\n") : ""}
${line}
Source: adamnowak.online/tools/loyalty-tier-planner`
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function TierPlanner() {
  const [state, setState] = useState<PlannerState>(DEFAULT_STATE)
  const [csv, setCsv] = useState<CsvData | null>(null)
  const [csvStatus, setCsvStatus] = useState<CsvStatus>({ kind: "idle" })
  // A shared CSV link restores settings without data; its thresholds are kept for the first file uploaded
  const [linkWithoutData, setLinkWithoutData] = useState(false)
  const keepLinkThresholds = useRef(false)
  const loadToken = useRef(0)

  useEffect(() => {
    // Restore a shared link after mount; the server render has no URL params
    const params = new URLSearchParams(window.location.search)
    if (!params.toString()) return
    const restored = paramsToState(params)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(restored)
    if (restored.source === "csv") {
      setLinkWithoutData(true)
      keepLinkThresholds.current = params.has("t")
    }
  }, [])

  const [copied, setCopied] = useState<"" | "summary" | "link">("")
  const [howToOpen, setHowToOpen] = useState(false)
  const [defsOpen, setDefsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}?${stateToParams(state).toString()}`)
  }, [state])

  const customers = useMemo(() => customersFor(state.source, state.approx, csv), [state.source, state.approx, csv])
  // Path A: each point stands for customers ÷ 5,000; path C with sampling: valid rows ÷ sample size
  const weight = state.source === "approx"
    ? state.approx.customers / APPROX_SAMPLE_SIZE
    : state.source === "csv" && csv && csv.customers.length > 0 ? csv.validRows / csv.customers.length : 1
  const hasData = customers.length > 0
  // Results follow the inputs with a short lag, so sliders stay smooth on up to 50,000 uploaded customers
  const calc = useDeferredValue(state)
  const result = useMemo(() => planTiers(customers, calc, weight), [customers, calc, weight])
  // Same flags as result.extremes.flags, but stable while only the programme settings change
  const flags = useMemo(() => detectExtremes(customers).flags, [customers])

  const { current, thresholds, excludeExtremes, softLanding } = calc
  const change = useMemo(() => {
    if (!current) return null
    const population = analysisPopulation(customers, flags, excludeExtremes)
    return thresholdChange(population, current, thresholds, softLanding, weight)
  }, [customers, flags, current, thresholds, excludeExtremes, softLanding, weight])

  // Spend-distribution summary for the bot; changes only with the data, not with the sliders
  const distribution = useMemo(() => distributionSummary(customers), [customers])

  // Slider range ignores extreme customers so it stays usable
  const sliderRange = useMemo(() => {
    const all = sortAscending(customers.map((c) => c.spend))
    const clean = sortAscending(customers.filter((_, i) => !flags[i]).map((c) => c.spend))
    const min = Math.max(1, niceRound(quantileSorted(all, 0.02)))
    const max = Math.max(min * 10, niceRound(quantileSorted(clean, 0.999) * 2))
    return { min, max }
  }, [customers, flags])

  const update = useCallback((patch: Partial<PlannerState>) => setState((prev) => ({ ...prev, ...patch })), [])
  const setApprox = (key: keyof ApproxInputs) => (v: number) => setState((prev) => ({ ...prev, approx: { ...prev.approx, [key]: v } }))

  const setSource = (source: Source) => setState((prev) => {
    if (prev.source === source) return prev
    const next = customersFor(source, prev.approx, csv)
    // Without an uploaded file there is nothing to suggest from yet; keep the thresholds
    return { ...prev, source, thresholds: next.length ? suggestThresholds(next, prev.tierCount) : prev.thresholds }
  })

  const loadFile = (file: File) => {
    const token = ++loadToken.current
    const fail = (error: CsvFailure) => {
      if (token !== loadToken.current) return
      setCsv(null)
      setCsvStatus({ kind: "error", fileName: file.name, error })
    }
    const refused = checkCsvFile(file)
    if (refused) return fail(refused)
    setCsvStatus({ kind: "loading", fileName: file.name, progress: 0 })
    // Read locally with FileReader: the contents are never sent anywhere
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (token === loadToken.current && e.lengthComputable) setCsvStatus({ kind: "loading", fileName: file.name, progress: e.loaded / e.total })
    }
    reader.onerror = () => fail({ ok: false, kind: "format", message: "We couldn't read this file. It may be damaged or still open in another program." })
    reader.onload = () => {
      if (token !== loadToken.current) return
      setCsvStatus({ kind: "loading", fileName: file.name, progress: null })
      // Let the "Checking rows" state paint before parsing, which can take a moment near 50,000 rows
      setTimeout(() => {
        if (token !== loadToken.current) return
        const parsed = parseCustomerCsv(typeof reader.result === "string" ? reader.result : "")
        if (!parsed.ok) return fail(parsed)
        const data: CsvData = { ...parsed, fileName: file.name }
        const keep = keepLinkThresholds.current
        keepLinkThresholds.current = false
        setCsv(data)
        setCsvStatus({ kind: "idle" })
        setLinkWithoutData(false)
        setState((prev) => ({
          ...prev,
          source: "csv",
          thresholds: keep || data.customers.length === 0 ? prev.thresholds : suggestThresholds(data.customers, prev.tierCount),
        }))
      }, 30)
    }
    reader.readAsText(file)
  }

  const setTierCount = (tierCount: number) => setState((prev) => {
    if (tierCount === prev.tierCount) return prev
    const base = customersFor(prev.source, prev.approx, csv)
    const suggested = suggestThresholds(base.length ? base : customersFor("approx", prev.approx), tierCount)
    const kept = prev.thresholds.slice(0, tierCount)
    const merged = suggested.map((v, i) => kept[i] ?? Math.max(v, niceRound((kept[kept.length - 1] ?? v) * 1.6)))
    return { ...prev, tierCount, thresholds: enforceIncreasing(merged, Math.max(0, kept.length - 1)) }
  })

  const setThreshold = (i: number) => (v: number) => setState((prev) => {
    const next = [...prev.thresholds]
    next[i] = v
    return { ...prev, thresholds: enforceIncreasing(next, i) }
  })

  const setBenefit = (i: number, patch: Partial<Benefit>) => setState((prev) => {
    const benefits = [...prev.benefits]
    const merged = { ...benefits[i], ...patch }
    if (patch.type && patch.type !== benefits[i].type) merged.value = patch.type === "discount" ? 2 : 10
    benefits[i] = merged
    return { ...prev, benefits }
  })

  const setName = (i: number, name: string) => setState((prev) => {
    const names = [...prev.names]
    names[i] = name.slice(0, 24)
    return { ...prev, names }
  })

  const nameOf = (i: number) => state.names[i]?.trim() || DEFAULT_NAMES[i]
  const displayNames = DEFAULT_NAMES.map((_, i) => nameOf(i))

  const reset = () => {
    loadToken.current++
    keepLinkThresholds.current = false
    setCsv(null)
    setCsvStatus({ kind: "idle" })
    setLinkWithoutData(false)
    setState(DEFAULT_STATE)
  }

  const flash = (kind: "summary" | "link") => { setCopied(kind); setTimeout(() => setCopied(""), 2500) }
  const copySummary = () => {
    navigator.clipboard.writeText(buildSummary({ ...state, names: displayNames }, result, change, csv)).then(() => flash("summary"))
  }
  const shareUrl = () => { navigator.clipboard.writeText(window.location.href).then(() => flash("link")) }
  const scrollToResults = () => document.getElementById("tier-results")?.scrollIntoView({ behavior: "smooth", block: "start" })

  const submitFeedback = async () => {
    if (!feedback.trim()) return
    try {
      await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `[Loyalty Tier Planner] ${feedback.trim()}` }) })
      const { dataLayer } = window as Window & { dataLayer?: Record<string, unknown>[] }
      dataLayer?.push({
        event: "feedback_form_submit",
        form_location: "tier_planner",
      })
    } catch {}
    setFeedbackSent(true)
    setFeedback("")
  }

  const r = result
  const tiersNamed = r.tiers.map((t) => ({ ...t, name: displayNames[t.index] }))
  const top = tiersNamed[tiersNamed.length - 1]
  const extremesFound = r.extremes.count > 0
  const thresholdsChanged = state.current !== null && state.current.join(",") !== state.thresholds.join(",")
  const botContext = buildTierBotContext({
    source: BOT_SOURCES[calc.source],
    params: calc,
    result: { ...r, tiers: tiersNamed },
    distribution,
    change,
    currentThresholds: calc.current,
  })
  const buttonClass = "min-h-[44px] text-[11px] tracking-[0.08em] uppercase px-3 py-2 rounded border transition-colors"

  const dataSection = (
    <div className="mb-6">
      <SectionTitle>Your customers</SectionTitle>
      <Segmented<Source> label="Data source" value={state.source} onChange={setSource} fitLabels
        options={[{ value: "approx", label: "I don't have a file" }, { value: "sample", label: "Try sample data" }, { value: "csv", label: "Upload your own data (CSV)" }]} />
      {state.source === "csv" ? (
        <CsvUpload status={csvStatus} csv={csv} linkWithoutData={linkWithoutData} onFile={loadFile} />
      ) : state.source === "approx" ? (
        <div className="mt-3">
          <FieldRow label="Active customers" tooltip="Customers who bought at least once in the last 12 months.">
            <NumberField label="Active customers" value={state.approx.customers} min={100} max={100_000_000} onChange={setApprox("customers")} />
          </FieldRow>
          <FieldRow label="Typical (median) annual spend per customer" tooltip="Half your customers spend less than this in a year, half spend more.">
            <NumberField label="Typical (median) annual spend per customer" value={state.approx.medianSpend} min={1} max={1_000_000} prefix="€" onChange={setApprox("medianSpend")} />
          </FieldRow>
          <FieldRow label="Share of revenue from your top 20% of customers" tooltip={`Must be above 20%: an even spread gives exactly 20%. Accepted range ${TOP20_RANGE.min}–${TOP20_RANGE.max}%.`}>
            <NumberField label="Share of revenue from your top 20% of customers" value={state.approx.top20SharePct} min={TOP20_RANGE.min} max={TOP20_RANGE.max} suffix="%" onChange={setApprox("top20SharePct")} />
          </FieldRow>
          <FieldRow label="Typical number of purchases per customer per year" tooltip="The median: half your customers buy less often, half more often.">
            <NumberField label="Typical number of purchases per customer per year" value={state.approx.purchasesPerYear} min={0.1} max={1_000} onChange={setApprox("purchasesPerYear")} />
          </FieldRow>
          <div className="mt-3 rounded-md px-3 py-2.5 text-[12px] leading-snug" style={{ background: "var(--paper)", color: "var(--ink)" }}>
            <strong className="font-semibold">{APPROX_LABEL}</strong>
            <span className="block mt-1" style={{ color: "var(--muted)" }}>{BASKET_SENTENCE} Typical basket here: {fmtEur(approxBasket(state.approx))}.</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-md px-3 py-2.5 text-[12px] leading-snug" style={{ background: "var(--paper)", color: "var(--ink)" }}>
          <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded mr-1.5 align-middle"
            style={{ background: "rgba(192,138,62,0.18)", color: "#7a5520", fontFamily: "Syne, sans-serif" }}>Example</span>
          Sample data: {fmtInt(SAMPLE_SIZE)} fictional customers with annual spend and number of purchases, including {SAMPLE_CORPORATE} corporate buyers who spend far more than anyone else.
        </div>
      )}
    </div>
  )

  const chart = (
    <OutCard title="Spend distribution and thresholds">
      <DistributionChart customers={customers} flags={flags} thresholds={state.thresholds} names={displayNames} excludeExtremes={state.excludeExtremes} />
    </OutCard>
  )

  return (
    <div style={{ "--ink": "#0A0A08", "--paper": "#EFEFEB", "--green": "#1E4530", "--gl": "#4CAF7D", "--muted": "#6b6b68", "--border": "rgba(10,10,8,0.12)", "--card": "#ffffff", fontFamily: "Inter, sans-serif", color: "var(--ink)" } as React.CSSProperties}>
      <div className="px-5 mb-4 text-[14px] leading-relaxed max-w-3xl" style={{ color: "var(--ink)" }}>
        <p>Tiers work when each level holds the customers it was built for and the next level stays within reach. Start from the shape of your own customer base, place the thresholds, and see who lands in each tier, what their benefits cost against the margin they bring, and how far a typical member is from the next level.</p>
      </div>

      <details open={howToOpen} onToggle={(e) => setHowToOpen((e.target as HTMLDetailsElement).open)}
        className="mb-4 mx-5 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <summary className="px-4 py-3 min-h-[44px] cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)", listStyle: "none" }}>
          <span>How to use</span>
          {howToOpen
            ? <span style={{ color: "var(--muted)" }}>−</span>
            : <span style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif", fontSize: "11px" }}>Start here →</span>
          }
        </summary>
        <div className="px-4 pb-4 text-[13px] leading-relaxed space-y-2" style={{ color: "var(--muted)" }}>
          <p><strong style={{ color: "var(--ink)" }}>1. Describe your customers.</strong> Enter four numbers about their spend and how often they buy, try the sample data, or upload your own CSV file.</p>
          <p><strong style={{ color: "var(--ink)" }}>2. Place the thresholds.</strong> Choose how many tiers sit above the base level and drag each threshold. The dashed lines on the chart move with you.</p>
          <p><strong style={{ color: "var(--ink)" }}>3. Add margin and benefits.</strong> Pick a benefit for each tier and read its cost against the margin that tier brings, along with how many purchases separate a typical member from the next tier.</p>
          <p><strong style={{ color: "var(--ink)" }}>4. Test a change.</strong> Save today&apos;s thresholds with Set as current programme, then move them to see how many current members would lose status.</p>
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t lg:border-b" style={{ borderColor: "var(--border)" }}>
        <div id="tier-inputs" className="p-5 lg:border-r min-w-0" style={{ borderColor: "var(--border)" }}>
          {dataSection}

          {hasData && (<>
            <div className="lg:hidden mb-6">{chart}</div>

            <SectionTitle>Tiers and thresholds</SectionTitle>
            <div className="mb-4">
              <div className="text-[12.5px] font-medium mb-1.5">Tiers above the base level</div>
              <Segmented<number> label="Tiers above the base level" value={state.tierCount} onChange={setTierCount}
                options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))} />
            </div>

            <div className="rounded-md p-3 mb-3" style={{ background: "var(--paper)" }}>
              <FieldRow label="Base level name">
                <input type="text" value={state.names[0]} aria-label="Base level name" maxLength={24}
                  onChange={(e) => setName(0, e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) setName(0, DEFAULT_NAMES[0]) }}
                  className="text-right text-[16px] w-[9rem] min-h-[44px] flex-shrink-0 bg-transparent border-b focus:outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--ink)" }} />
              </FieldRow>
            </div>

            {state.thresholds.map((t, i) => {
              const benefit = state.benefits[i]
              return (
                <div key={i} className="rounded-md p-3 mb-3" style={{ background: "var(--paper)" }}>
                  <FieldRow label={`Tier ${i + 1} name`}>
                    <input type="text" value={state.names[i + 1]} aria-label={`Tier ${i + 1} name`} maxLength={24}
                      onChange={(e) => setName(i + 1, e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) setName(i + 1, DEFAULT_NAMES[i + 1]) }}
                      className="text-right text-[16px] font-semibold w-[9rem] min-h-[44px] flex-shrink-0 bg-transparent border-b focus:outline-none"
                      style={{ borderColor: "var(--border)", color: "var(--ink)" }} />
                  </FieldRow>
                  <ThresholdSlider label={`Spend to reach ${displayNames[i + 1]}`}
                    tooltip="Annual spend a customer needs to reach this tier. Each threshold stays above the one below it."
                    value={t} min={sliderRange.min} max={sliderRange.max} onChange={setThreshold(i)} />
                  <FieldRow label="Benefit" tooltip="Discount: a % off everything the tier buys. Operational (e.g. free delivery, priority service) and recognition (e.g. early access, a named contact): your cost per member a year.">
                    <select value={benefit.type} aria-label={`${displayNames[i + 1]} benefit type`}
                      onChange={(e) => setBenefit(i, { type: e.target.value as BenefitType })}
                      className="text-[16px] min-h-[44px] w-[9rem] flex-shrink-0 bg-transparent border-b focus:outline-none"
                      style={{ borderColor: "var(--border)", color: "var(--ink)" }}>
                      <option value="discount">Discount %</option>
                      <option value="operational">Operational</option>
                      <option value="recognition">Recognition</option>
                    </select>
                  </FieldRow>
                  <FieldRow label={benefit.type === "discount" ? "Discount on the tier's spend" : "Cost per member a year"}>
                    <NumberField label={`${displayNames[i + 1]} benefit value`} value={benefit.value} min={0}
                      max={benefit.type === "discount" ? 50 : 100_000}
                      prefix={benefit.type === "discount" ? undefined : "€"} suffix={benefit.type === "discount" ? "%" : undefined}
                      onChange={(v) => setBenefit(i, { value: v })} />
                  </FieldRow>
                </div>
              )
            })}

            <div className="mb-6">
              <button type="button" onClick={() => update({ current: [...state.thresholds] })}
                className={`${buttonClass} w-full`}
                style={{ fontFamily: "Syne, sans-serif", background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>
                {state.current ? "Update current programme" : "Set as current programme"}
              </button>
              <Note>{state.current
                ? `Current programme: ${state.current.map((v, i) => `${displayNames[i + 1]} from ${fmtEur(v)}`).join(" · ")}. Move a threshold to see how current members would be affected.`
                : "Saves today's thresholds. Move the sliders afterwards to see how current members would be affected."}</Note>
              {state.current && (
                <button type="button" onClick={() => update({ current: null })} className="min-h-[44px] text-[12px] underline"
                  style={{ color: "var(--muted)", fontFamily: "Syne, sans-serif", background: "none" }}>Clear current programme</button>
              )}
            </div>

            <SectionTitle>Programme rules</SectionTitle>
            <SliderInput label="Gross margin" tooltip="Your gross margin on what customers buy. Used to set benefit costs against the margin each tier brings."
              value={state.marginPct} min={1} max={90} step={1} suffix="%" onChange={(v) => update({ marginPct: v })} />

            <div className="mb-4">
              <div className="mb-1.5"><LabelWithTooltip label="Qualification window" tooltip="The period over which spend counts towards a threshold." /></div>
              <Segmented<number> label="Qualification window" value={state.windowMonths} onChange={(v) => update({ windowMonths: v as 12 | 24 | 36 })}
                options={[12, 24, 36].map((m) => ({ value: m, label: `${m} months` }))} />
              <Note>{WINDOW_SENTENCE}</Note>
            </div>

            <div className="mb-4">
              <div className="mb-1.5"><LabelWithTooltip label="Status validity" tooltip="How long a tier lasts once reached, before the customer qualifies again." /></div>
              <Segmented<number> label="Status validity" value={state.validityYears} onChange={(v) => update({ validityYears: v as 1 | 2 | 3 })}
                options={[1, 2, 3].map((y) => ({ value: y, label: plural(y, "year") }))} />
            </div>

            <Toggle label="Soft landing (drop max one tier)" tooltip="A member who does not requalify drops one tier per period instead of falling to the base level."
              checked={state.softLanding} onChange={(v) => update({ softLanding: v })} />

            <Toggle label="Keep status through non-purchase activity" tooltip="Members can keep their tier through activity other than buying."
              checked={state.activityKeep} onChange={(v) => update({ activityKeep: v })}>
              {state.activityKeep && <Note>{ACTIVITY_SENTENCE}</Note>}
            </Toggle>

            <Toggle label="Exclude extreme customers from threshold setting" tooltip="Leaves out customers who spend far more than everyone else, such as business buyers, so they do not pull the picture."
              checked={state.excludeExtremes} onChange={(v) => update({ excludeExtremes: v })}>
              <Note>{EXTREME_RULE} Limit in this data: {Number.isFinite(r.extremes.limit) ? fmtEur(r.extremes.limit) : "n/a"}.</Note>
              <Note>{extremesFound
                ? `Found: ${plural(r.extremes.count, "customer")} (${fmtShare(r.extremes.customerShare)} of customers, ${fmtShare(r.extremes.revenueShare)} of revenue).${state.excludeExtremes ? " Tier results below leave them out; in a live programme they would still reach the top tier." : ""}`
                : "No customers meet this rule in the current data."}</Note>
            </Toggle>
          </>)}
        </div>

        <div id="tier-results" className="p-5 min-w-0 scroll-mt-[64px]" style={{ background: "#fafaf8" }}>
          <div className="print-header" style={{ display: "none" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "10px", color: "#6b6b68", marginBottom: "4px" }}>
              adamnowak.online/tools/loyalty-tier-planner
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "20px", color: "#0A0A08" }}>
              Loyalty Tier Planner
            </div>
            <div style={{ fontSize: "10px", color: "#6b6b68", marginTop: "2px" }} suppressHydrationWarning>{new Date().toLocaleDateString("en-GB")}</div>
          </div>

          {hasData ? (<>
            {state.source === "csv" && csv?.sampled && (
              <p role="note" className="rounded-md px-3 py-2.5 mb-3 text-[12px] leading-snug"
                style={{ background: "rgba(192,138,62,0.14)", color: "#7a5520" }}>{csvSampleSentence(csv)}</p>
            )}
            <div className="hidden lg:block">{chart}</div>

            <div className="rounded-lg p-5 mb-3" style={{ background: "var(--green)" }}>
              <div className="text-[10px] tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Syne, sans-serif" }}>Top tier · {top.name}</div>
              <div className="leading-none mb-1" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "3.2rem", color: "#fff" }}>{fmtShare(top.customerShare)}</div>
              <div className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
                of customers<span className="mx-2 opacity-40">·</span>{fmtShare(top.revenueShare)} of revenue<span className="mx-2 opacity-40">·</span>{plural(state.tierCount, "tier")} above {displayNames[0]}
              </div>
              <div className="text-[12px] rounded px-2.5 py-2" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "Syne, sans-serif" }}>
                Rules to explain to a customer: {r.complexity.count}
                {r.complexity.count > 0 && (
                  <ul className="mt-1 pl-4 list-disc space-y-0.5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}>
                    {r.complexity.mechanisms.map((mechanism) => (
                      <li key={mechanism} className="text-[11px]">{mechanism}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {state.current && change && (
              <OutCard title="Change against current programme">
                {!thresholdsChanged ? (
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>Thresholds match the current programme. Move a threshold to see how current members would be affected.</p>
                ) : (
                  <div className="text-[13px] leading-relaxed space-y-2">
                    <p>
                      {change.losing > 0
                        ? <>With these thresholds, <strong>{fmtInt(change.losing)}</strong> of {fmtInt(change.currentMembers)} current members ({fmtShare(change.currentMembers ? change.losing / change.currentMembers : 0)}) would lose status when their status period ends.</>
                        : <>With these thresholds, none of the {fmtInt(change.currentMembers)} current members would lose status.</>}
                    </p>
                    <p style={{ color: "var(--muted)" }}>Until then they keep the status they have. Status validity: {plural(state.validityYears, "year")}.</p>
                    {change.losing > 0 && (
                      <p>{state.softLanding
                        ? change.caughtBySoftLanding > 0
                          ? <>Soft landing: <strong>{fmtInt(change.caughtBySoftLanding)}</strong> of them drop one tier where they would otherwise fall further.</>
                          : <>Soft landing: none of them would fall more than one tier anyway.</>
                        : <>Without soft landing, <strong>{fmtInt(change.fallingMoreThanOne)}</strong> of them would fall more than one tier.</>}
                      </p>
                    )}
                    {change.losing > 0 && (
                      <ul className="text-[12px] space-y-0.5" style={{ color: "var(--muted)" }}>
                        {change.byTier.filter((t) => t.members > 0).map((t) => (
                          <li key={t.tier}>{displayNames[t.tier]}: {fmtInt(t.losing)} of {fmtInt(t.members)} members lose status</li>
                        ))}
                      </ul>
                    )}
                    {change.gaining > 0 && <p style={{ color: "var(--muted)" }}>{plural(change.gaining, "customer")} would reach a higher tier than today.</p>}
                  </div>
                )}
              </OutCard>
            )}

            {tiersNamed.slice().reverse().map((t) => {
              const next = t.reach ? tiersNamed[t.reach.nextTier] : null
              return (
                <OutCard key={t.index} title={
                  <span className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: TIER_COLOURS[t.index] }} />
                      <span className="truncate" style={{ color: "var(--ink)", fontWeight: 600 }}>{t.name}</span>
                    </span>
                    <span className="flex-shrink-0">{t.index === 0 ? `below ${fmtEur(tiersNamed[1].threshold)}` : `from ${fmtEur(t.threshold)}`}</span>
                  </span>
                }>
                  {t.customers === 0 ? (
                    <p className="text-[13px]" style={{ color: "var(--muted)" }}>No customers in this tier with these thresholds.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <MetricCard label="Customers" value={fmtShare(t.customerShare)} sub={fmtInt(t.customers)} />
                        <MetricCard label="Revenue" value={fmtShare(t.revenueShare)} sub={fmtEur(t.revenue)} />
                        <MetricCard label="Tier margin" value={fmtEur(t.margin)} sub={`at ${state.marginPct}% gross margin`} />
                        <MetricCard label="Benefit cost" value={t.benefit ? fmtEur(t.benefitCost) : "—"}
                          sub={t.benefit ? `${t.benefitCostPctOfMargin.toFixed(1)}% of tier margin` : "No benefits at this level"} />
                      </div>
                      <div className="text-[13px] leading-relaxed space-y-1.5">
                        {t.benefit && <p style={{ color: "var(--muted)" }}>Benefit: {benefitLabel(t.benefit)}.</p>}
                        {t.discountOnExisting !== null && (
                          <p>The discount gives away <strong>{fmtEur(t.discountOnExisting)}</strong> a year on purchases this tier already makes today: {t.benefitCostPctOfMargin.toFixed(1)}% of its margin.</p>
                        )}
                        {t.reach && next ? (
                          <>
                            <p>{reachSentence(t.name, next.name, t.reach.extraPurchases, t.reach.currentPurchases)}</p>
                            <p style={{ color: "var(--muted)" }}>{windowSentence(t.name, next.name, Math.round(t.reach.monthsAtPace), state.windowMonths)}</p>
                            <p style={{ color: "var(--muted)" }}>{fmtShare(t.reach.nearShare)} of {t.name} members are within one typical purchase ({fmtEur(t.reach.basket)}) of {next.name}.</p>
                          </>
                        ) : (
                          <p style={{ color: "var(--muted)" }}>This is the top tier. Typical member: {fmtEur(t.medianSpend)} a year across {purchasesToday(t.medianPurchases)} purchases.</p>
                        )}
                      </div>
                    </>
                  )}
                </OutCard>
              )
            })}

            <OutCard title="Extreme customers and thresholds">
              {extremesFound ? (
                <div className="text-[13px] leading-relaxed space-y-1.5">
                  <p>Average annual spend is <strong>{fmtEur(r.percentileShift.meanAll)}</strong> with extreme customers and <strong>{fmtEur(r.percentileShift.meanClean)}</strong> without them.</p>
                  {r.percentileShift.rows.map((row) => (
                    <p key={row.tier} style={{ color: "var(--muted)" }}>
                      The {displayNames[row.tier]} threshold ({fmtEur(row.threshold)}) sits at the {Math.round(row.percentile * 100)}th percentile of all customers. Without extreme customers, the same percentile is {fmtEur(row.valueWithout)}.
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: "var(--muted)" }}>No customers meet the extreme-customer rule in this data, so percentile thresholds are the same with and without them.</p>
              )}
            </OutCard>

            <TierPlannerChat context={botContext} />
          </>) : (
            <OutCard title="Results">
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {csv ? "No usable rows in this file. Replace it with a file based on the template to see your tiers." : "Upload a CSV file to see your tiers. Results appear here once the file is checked."}
              </p>
            </OutCard>
          )}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center px-5 py-3 border-t" style={{ borderColor: "var(--border)", background: "var(--paper)" }}>
          {([["Share URL", shareUrl], ["Copy summary", copySummary], ["↺ Reset", reset], ["Print / PDF", () => window.print()]] as [string, () => void][])
            .filter(([label]) => hasData || label === "Share URL" || label === "↺ Reset").map(([label, fn]) => (
            <button key={label} type="button" onClick={fn} className={buttonClass}
              style={{ fontFamily: "Syne, sans-serif", borderColor: "var(--border)", color: "var(--ink)", background: "none" }}>{label}</button>
          ))}
          {copied && <span className="col-span-2 text-[11px]" role="status" style={{ color: "var(--gl)", fontFamily: "Syne, sans-serif" }}>{copied === "link" ? "Link copied ✓" : "Summary copied ✓"}</span>}
          {state.source === "csv" && (
            <p className="col-span-2 sm:basis-full text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
              The link keeps your programme settings but not your uploaded data. Anyone who opens it will need to upload their own file.
            </p>
          )}
        </div>

        <details open={defsOpen} onToggle={(e) => setDefsOpen((e.target as HTMLDetailsElement).open)} className="border-t" style={{ borderColor: "var(--border)" }}>
          <summary className="px-5 py-3 min-h-[44px] cursor-pointer text-[12px] font-medium select-none flex items-center justify-between"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--ink)", listStyle: "none" }}>
            <span>Definitions & methodology</span>
            <span style={{ color: "var(--muted)" }}>{defsOpen ? "−" : "+"}</span>
          </summary>
          <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
            {[
              { term: "Threshold", def: "The annual spend a customer needs to reach a tier. Each threshold sits above the one below it, so every customer belongs to exactly one tier." },
              { term: "Qualification window", def: "The period over which spend counts towards a threshold. A longer window gives customers more time to get there. Tier shares in this tool use one year of spend." },
              { term: "Status validity", def: "How long a tier lasts once reached. When it ends, the member qualifies again on their spend." },
              { term: "Soft landing", def: "A member who does not requalify drops at most one tier per period, instead of falling to the base level." },
              { term: "Extreme customers", def: "Customers whose annual spend lies above Q3 + 3 × IQR, measured on the log of spend. They are often business or corporate buyers. Left in, they can pull thresholds up to levels few other customers reach." },
              { term: "Reachability", def: "How many extra purchases at the tier's typical basket separate a typical (median) member from the next threshold, next to how many purchases that member makes a year today." },
              { term: "Typical basket", def: "The median spend per purchase among a tier's members. In the approximation from four numbers it is the same for everyone: median annual spend ÷ purchases a year." },
              { term: "Uploaded CSV file", def: `Read and checked in your browser; nothing is sent to a server. Columns are matched by name: annual_spend and purchases. A row is skipped when spend is zero or below, a value is missing or not a number, or there are no purchases despite spend. Above ${CSV_ROW_LIMIT.toLocaleString("en-GB")} valid rows, results use a random sample of ${CSV_ROW_LIMIT.toLocaleString("en-GB")} drawn with a fixed seed, so the same file gives the same results; customer counts and revenue are scaled back to the whole file.` },
              { term: "Approximation from four numbers", def: "Spend is modelled as a log-normal distribution with your median, spread to match the revenue share of your top 20%. It is drawn as 5,000 evenly spaced points, so results do not change between visits." },
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

      {hasData && <button type="button" onClick={scrollToResults}
        className="tp-sticky lg:hidden sticky bottom-0 z-30 w-full grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-5 pt-2.5 text-left min-h-[56px]"
        style={{ background: "var(--green)", color: "#fff", boxShadow: "0 -2px 10px rgba(10,10,8,0.15)", paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.1em] uppercase leading-tight" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Syne, sans-serif" }}>Tiers</span>
          <span className="block leading-none mt-0.5" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.6rem" }}>{state.tierCount}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.1em] uppercase leading-tight truncate" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Syne, sans-serif" }}>In top tier</span>
          <span className="block leading-none mt-0.5" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.6rem" }}>{fmtShare(top.customerShare)}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.1em] uppercase leading-tight" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Syne, sans-serif" }}>Rules</span>
          <span className="block leading-none mt-0.5" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.6rem" }}>{r.complexity.count}</span>
        </span>
        <span aria-hidden="true" className="text-[18px]" style={{ color: "rgba(255,255,255,0.75)" }}>↓</span>
        <span className="sr-only">Show tier results</span>
      </button>}

      <style>{`
.tp-range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  height: 44px;
  margin: 0;
  background: transparent;
}
.tp-range:focus { outline: none; }
.tp-spin { animation: tp-spin 0.8s linear infinite; }
@keyframes tp-spin { to { transform: rotate(360deg); } }
.tp-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #4CAF7D 0%, #4CAF7D var(--pct), rgba(10,10,8,0.12) var(--pct), rgba(10,10,8,0.12) 100%);
}
.tp-range::-webkit-slider-thumb {
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
.tp-range:focus-visible::-webkit-slider-thumb { outline: 2px solid #1E4530; outline-offset: 2px; }
.tp-range::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(10,10,8,0.12);
}
.tp-range::-moz-range-progress {
  height: 4px;
  border-radius: 2px;
  background: #4CAF7D;
}
.tp-range::-moz-range-thumb {
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4CAF7D;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.tp-range:focus-visible::-moz-range-thumb { outline: 2px solid #1E4530; outline-offset: 2px; }
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Hide interactive elements */
  input[type="range"], textarea, button, select,
  details summary, .tp-sticky,
  nav, header { display: none !important; }

  details > div { display: block !important; }

  /* Reset layout */
  body { font-size: 11px !important; background: white !important; margin: 0; }
  #tier-inputs { display: block !important; width: 100% !important; page-break-after: always; padding: 20px !important; }
  #tier-results { display: block !important; width: 100% !important; background: white !important; padding: 20px !important; }
  #tier-inputs .lg\\:hidden { display: none !important; }
  #tier-results .hidden { display: block !important; }

  /* Cards */
  [class*="rounded-lg border"] { break-inside: avoid; margin-bottom: 8px !important; }

  /* Print header visible */
  .print-header { display: block !important; margin-bottom: 16px !important; }
}
      `}</style>
    </div>
  )
}
