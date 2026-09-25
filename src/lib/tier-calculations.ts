// Loyalty Tier Planner — pure calculation functions. No DOM, no React.

export interface Customer {
  spend: number
  purchases: number
}

// ─────────────────────────────────────────────────────────────
// Normal distribution helpers
// ─────────────────────────────────────────────────────────────

// Complementary error function (Numerical Recipes erfcc, fractional error < 1.2e-7)
function erfc(x: number): number {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
    t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
    t * (-0.82215223 + t * 0.17087277)))))))))
  return x >= 0 ? r : 2 - r
}

/** Standard normal CDF Φ(x). */
export function normCdf(x: number): number {
  if (x === Infinity) return 1
  if (x === -Infinity) return 0
  return 0.5 * erfc(-x / Math.SQRT2)
}

/** Upper tail 1 − Φ(x), accurate for large x. */
function normTail(x: number): number {
  if (x === Infinity) return 0
  if (x === -Infinity) return 1
  return 0.5 * erfc(x / Math.SQRT2)
}

/** Φ(hi) − Φ(lo), using whichever tail keeps precision. */
function normBetween(lo: number, hi: number): number {
  return lo >= 0 ? normTail(lo) - normTail(hi) : normCdf(hi) - normCdf(lo)
}

/** Inverse standard normal CDF Φ⁻¹(p) (Acklam, refined with one Halley step). */
export function normInv(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const pLow = 0.02425
  let x: number
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= 1 - pLow) {
    const q = p - 0.5
    const r = q * q
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p))
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  const e = normCdf(x) - p
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2)
  return x - u / (1 + (x * u) / 2)
}

// ─────────────────────────────────────────────────────────────
// Path A — approximation from four numbers (log-normal)
// ─────────────────────────────────────────────────────────────

export interface ApproxInputs {
  customers: number
  medianSpend: number
  top20SharePct: number
  purchasesPerYear: number
}

export const DEFAULT_APPROX: ApproxInputs = {
  customers: 10_000,
  medianSpend: 300,
  top20SharePct: 55,
  purchasesPerYear: 4,
}

/** Valid range for the top-20% revenue share. An even spread gives exactly 20%. */
export const TOP20_RANGE = { min: 21, max: 95 }

/** Number of quantile points used to represent the approximated distribution. */
export const APPROX_SAMPLE_SIZE = 5_000

/** Share of revenue held by the top p of a log-normal population with spread σ. */
export function lognormalTopShare(sigma: number, p = 0.2): number {
  return normTail(normInv(1 - p) - sigma)
}

/** Finds σ so that the top 20% hold the given share of revenue (bisection). */
export function fitSigma(top20SharePct: number): number {
  const target = Math.min(TOP20_RANGE.max, Math.max(TOP20_RANGE.min, top20SharePct)) / 100
  let lo = 0
  let hi = 6
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (lognormalTopShare(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function isValidTop20Share(pct: number): boolean {
  return pct >= TOP20_RANGE.min && pct <= TOP20_RANGE.max
}

/**
 * Deterministic sample from the fitted log-normal. Each point stands for one
 * equal slice of customers and carries that slice's mean spend, so totals and
 * top-share match the fitted distribution exactly.
 */
export function approximateCustomers(inputs: ApproxInputs, n = APPROX_SAMPLE_SIZE): Customer[] {
  const sigma = fitSigma(inputs.top20SharePct)
  const median = Math.max(1, inputs.medianSpend)
  const basket = median / Math.max(0.1, inputs.purchasesPerYear)
  const scale = median * Math.exp((sigma * sigma) / 2) * n
  const out: Customer[] = []
  let prev = -Infinity
  for (let i = 0; i < n; i++) {
    const next = i === n - 1 ? Infinity : normInv((i + 1) / n)
    const spend = sigma < 1e-9 ? median : scale * normBetween(prev - sigma, next - sigma)
    out.push({ spend, purchases: spend / basket })
    prev = next
  }
  return out
}

/** Typical basket assumed in path A: median spend ÷ purchases a year. */
export function approxBasket(inputs: ApproxInputs): number {
  return inputs.medianSpend / Math.max(0.1, inputs.purchasesPerYear)
}

// ─────────────────────────────────────────────────────────────
// Path B — built-in sample data (fictional, deterministic)
// ─────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const SAMPLE_SIZE = 5_000
export const SAMPLE_CORPORATE = 18

let sampleCache: Customer[] | null = null

/** 4,982 retail customers plus 18 corporate buyers. Same output on every call. */
export function sampleCustomers(): Customer[] {
  if (sampleCache) return sampleCache
  const rand = mulberry32(20260924)
  const gauss = () => {
    const u = Math.max(rand(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
  }
  const out: Customer[] = []
  for (let i = 0; i < SAMPLE_SIZE - SAMPLE_CORPORATE; i++) {
    const rate = 3 * Math.exp(0.75 * gauss())
    // Poisson draw (Knuth), at least one purchase for an active customer
    let k = 0
    let p = 1
    const limit = Math.exp(-rate)
    do { k++; p *= rand() } while (p > limit)
    const purchases = Math.max(1, k - 1)
    const basket = 55 * Math.exp(0.45 * gauss())
    let spend = 0
    for (let j = 0; j < purchases; j++) spend += basket * Math.exp(0.25 * gauss())
    out.push({ spend: Math.round(spend * 100) / 100, purchases })
  }
  for (let i = 0; i < SAMPLE_CORPORATE; i++) {
    const purchases = 90 + Math.floor(rand() * 50)
    const basket = 320 + rand() * 80
    out.push({ spend: Math.round(purchases * basket * 100) / 100, purchases })
  }
  sampleCache = out
  return out
}

// ─────────────────────────────────────────────────────────────
// Statistics helpers
// ─────────────────────────────────────────────────────────────

/** Linear-interpolated quantile of an ascending-sorted array. */
export function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const pos = Math.min(1, Math.max(0, q)) * (sorted.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function median(values: number[]): number {
  return quantileSorted([...values].sort((a, b) => a - b), 0.5)
}

/** Share of total spend held by the top `p` of customers. */
export function topShare(customers: Customer[], p = 0.2): number {
  const spends = customers.map((c) => c.spend).sort((a, b) => b - a)
  const total = spends.reduce((s, v) => s + v, 0)
  const k = Math.round(spends.length * p)
  let top = 0
  for (let i = 0; i < k; i++) top += spends[i]
  return total === 0 ? 0 : top / total
}

// ─────────────────────────────────────────────────────────────
// Extreme customers: spend above Q3 + 3 × IQR on log(spend)
// ─────────────────────────────────────────────────────────────

export interface ExtremeResult {
  limit: number
  flags: boolean[]
  count: number
  customerShare: number
  revenueShare: number
}

export function detectExtremes(customers: Customer[]): ExtremeResult {
  const logs = customers.filter((c) => c.spend > 0).map((c) => Math.log(c.spend)).sort((a, b) => a - b)
  const q1 = quantileSorted(logs, 0.25)
  const q3 = quantileSorted(logs, 0.75)
  const limit = logs.length ? Math.exp(q3 + 3 * (q3 - q1)) : Infinity
  const flags = customers.map((c) => c.spend > limit)
  let count = 0
  let extremeRevenue = 0
  let total = 0
  customers.forEach((c, i) => {
    total += c.spend
    if (flags[i]) { count++; extremeRevenue += c.spend }
  })
  return {
    limit,
    flags,
    count,
    customerShare: customers.length ? count / customers.length : 0,
    revenueShare: total ? extremeRevenue / total : 0,
  }
}

// ─────────────────────────────────────────────────────────────
// Programme parameters
// ─────────────────────────────────────────────────────────────

export type BenefitType = "discount" | "operational" | "recognition"

export interface Benefit {
  type: BenefitType
  /** discount: % of the tier's spend; operational / recognition: € per member per year */
  value: number
}

export interface ProgrammeParams {
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
}

export const MAX_TIERS = 4
export const DEFAULT_NAMES = ["Base", "Tier 1", "Tier 2", "Tier 3", "Tier 4"]
export const DEFAULT_BENEFITS: Benefit[] = [
  { type: "discount", value: 2 },
  { type: "operational", value: 20 },
  { type: "recognition", value: 10 },
  { type: "operational", value: 50 },
]

/** Share of customers at or above each threshold when thresholds are suggested from the data. */
const SUGGESTED_TOP_SHARES: Record<number, number[]> = {
  1: [0.2],
  2: [0.25, 0.05],
  3: [0.3, 0.1, 0.02],
  4: [0.35, 0.15, 0.05, 0.01],
}

/** Rounds a spend value to a readable step (€5 / €10 / €50 / €100 / …). */
export function niceRound(v: number): number {
  if (v <= 0) return 0
  const mag = 10 ** Math.floor(Math.log10(v))
  const step = v / mag < 2.5 ? mag / 20 : mag / 10
  return Math.max(1, Math.round(v / step) * step)
}

/** Thresholds strictly increasing and positive; entries after `changed` are pushed up, before it pushed down. */
export function enforceIncreasing(thresholds: number[], changed = 0, minGap = 1): number[] {
  const t = thresholds.map((v) => Math.max(minGap, Math.round(v)))
  for (let j = changed + 1; j < t.length; j++) if (t[j] < t[j - 1] + minGap) t[j] = t[j - 1] + minGap
  for (let j = changed - 1; j >= 0; j--) if (t[j] > t[j + 1] - minGap) t[j] = t[j + 1] - minGap
  // Pushing down may cross zero; re-run upwards from the start
  if (t[0] < minGap) {
    t[0] = minGap
    for (let j = 1; j < t.length; j++) if (t[j] < t[j - 1] + minGap) t[j] = t[j - 1] + minGap
  }
  return t
}

export function suggestThresholds(customers: Customer[], tierCount: number): number[] {
  const sorted = customers.map((c) => c.spend).sort((a, b) => a - b)
  const shares = SUGGESTED_TOP_SHARES[tierCount] ?? SUGGESTED_TOP_SHARES[2]
  return enforceIncreasing(shares.map((s) => niceRound(quantileSorted(sorted, 1 - s))), shares.length - 1)
}

/** Number of thresholds met: 0 = Base, 1 = Tier 1, … */
export function tierOf(spend: number, thresholds: number[]): number {
  let tier = 0
  for (const t of thresholds) if (spend >= t) tier++
  return tier
}

/** Where a member lands after re-qualification. With soft landing, at most one tier down. */
export function landingTier(currentTier: number, qualifiedTier: number, softLanding: boolean): number {
  if (qualifiedTier >= currentTier) return qualifiedTier
  return softLanding ? Math.max(qualifiedTier, currentTier - 1) : qualifiedTier
}

// ─────────────────────────────────────────────────────────────
// Tier results
// ─────────────────────────────────────────────────────────────

export interface Reachability {
  nextTier: number
  gap: number
  basket: number
  extraPurchases: number
  currentPurchases: number
  /** Months a typical member needs to spend the next threshold at today's pace */
  monthsAtPace: number
  withinWindow: boolean
  /** Share of the tier's members within one typical basket of the next threshold */
  nearShare: number
}

export interface TierResult {
  index: number
  name: string
  threshold: number
  customers: number
  customerShare: number
  revenue: number
  revenueShare: number
  margin: number
  benefit: Benefit | null
  benefitCost: number
  benefitCostPctOfMargin: number
  /** Discount only: margin given away on purchases the tier already makes */
  discountOnExisting: number | null
  medianSpend: number
  medianPurchases: number
  reach: Reachability | null
}

export interface PlannerResult {
  population: number
  totalRevenue: number
  extremes: ExtremeResult
  excluded: number
  tiers: TierResult[]
  complexity: { count: number; mechanisms: string[] }
  percentileShift: PercentileShift
}

export interface PercentileShift {
  meanAll: number
  meanClean: number
  rows: { tier: number; threshold: number; percentile: number; valueWithout: number }[]
}

export function complexity(params: Pick<ProgrammeParams, "windowMonths" | "softLanding" | "activityKeep">) {
  const mechanisms: string[] = []
  if (params.windowMonths !== 12) mechanisms.push(`Qualification window of ${params.windowMonths} months`)
  if (params.softLanding) mechanisms.push("Soft landing: drop at most one tier")
  if (params.activityKeep) mechanisms.push("Status kept through non-purchase activity")
  return { count: mechanisms.length, mechanisms }
}

/** Where each threshold sits as a percentile of all customers, and the spend at that percentile without extreme customers. */
export function percentileShift(customers: Customer[], flags: boolean[], thresholds: number[]): PercentileShift {
  const all = customers.map((c) => c.spend).sort((a, b) => a - b)
  const clean = customers.filter((_, i) => !flags[i]).map((c) => c.spend).sort((a, b) => a - b)
  const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0)
  const rows = thresholds.map((threshold, i) => {
    const below = lowerBound(all, threshold)
    const percentile = all.length ? below / all.length : 0
    return { tier: i + 1, threshold, percentile, valueWithout: quantileSorted(clean, percentile) }
  })
  return { meanAll: mean(all), meanClean: mean(clean), rows }
}

function lowerBound(sorted: number[], v: number): number {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < v) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** Customers used for tier results: everyone, or everyone except extreme customers. */
export function analysisPopulation(customers: Customer[], flags: boolean[], excludeExtremes: boolean): Customer[] {
  return excludeExtremes ? customers.filter((_, i) => !flags[i]) : customers
}

/**
 * `weight` = how many real customers each point stands for (path A: customers ÷ 5,000).
 * Counts, revenue and per-member costs scale with it; shares do not.
 */
export function planTiers(customers: Customer[], params: ProgrammeParams, weight = 1): PlannerResult {
  const tierCount = Math.min(MAX_TIERS, Math.max(1, Math.round(params.tierCount)))
  const thresholds = enforceIncreasing(params.thresholds.slice(0, tierCount))
  const extremes = detectExtremes(customers)
  const population = analysisPopulation(customers, extremes.flags, params.excludeExtremes)
  const totalRevenue = population.reduce((s, c) => s + c.spend, 0) * weight
  const margin = params.marginPct / 100

  const groups: Customer[][] = Array.from({ length: tierCount + 1 }, () => [])
  for (const c of population) groups[tierOf(c.spend, thresholds)].push(c)

  const tiers: TierResult[] = groups.map((members, index) => {
    const revenue = members.reduce((s, c) => s + c.spend, 0) * weight
    const count = members.length * weight
    const tierMargin = revenue * margin
    const benefit = index === 0 ? null : params.benefits[index - 1] ?? DEFAULT_BENEFITS[index - 1]
    const benefitCost = !benefit ? 0 : benefit.type === "discount" ? revenue * (benefit.value / 100) : count * benefit.value
    const medianSpend = median(members.map((c) => c.spend))
    const medianPurchases = median(members.map((c) => c.purchases))

    let reach: Reachability | null = null
    if (index < tierCount && members.length > 0) {
      const next = thresholds[index]
      const basket = median(members.filter((c) => c.purchases > 0).map((c) => c.spend / c.purchases))
      const gap = Math.max(0, next - medianSpend)
      const near = members.filter((c) => next - c.spend <= basket).length
      const monthsAtPace = medianSpend > 0 ? (next / medianSpend) * 12 : Infinity
      reach = {
        nextTier: index + 1,
        gap,
        basket,
        extraPurchases: basket > 0 ? Math.ceil(gap / basket) : Infinity,
        currentPurchases: medianPurchases,
        monthsAtPace,
        withinWindow: monthsAtPace <= params.windowMonths,
        nearShare: near / members.length,
      }
    }

    return {
      index,
      name: params.names[index] || DEFAULT_NAMES[index],
      threshold: index === 0 ? 0 : thresholds[index - 1],
      customers: count,
      customerShare: population.length ? members.length / population.length : 0,
      revenue,
      revenueShare: totalRevenue ? revenue / totalRevenue : 0,
      margin: tierMargin,
      benefit,
      benefitCost,
      benefitCostPctOfMargin: tierMargin > 0 ? (benefitCost / tierMargin) * 100 : 0,
      discountOnExisting: benefit?.type === "discount" ? benefitCost : null,
      medianSpend,
      medianPurchases,
      reach,
    }
  })

  return {
    population: population.length * weight,
    totalRevenue,
    extremes: { ...extremes, count: extremes.count * weight },
    excluded: params.excludeExtremes ? extremes.count * weight : 0,
    tiers,
    complexity: complexity(params),
    percentileShift: percentileShift(customers, extremes.flags, thresholds),
  }
}

// ─────────────────────────────────────────────────────────────
// Changing thresholds for existing members
// ─────────────────────────────────────────────────────────────

export interface ThresholdChange {
  currentMembers: number
  losing: number
  /** Losers whose new spend tier is two or more below today's */
  fallingMoreThanOne: number
  /** Of the losers, how many land exactly one tier down thanks to soft landing */
  caughtBySoftLanding: number
  gaining: number
  byTier: { tier: number; members: number; losing: number }[]
}

export function thresholdChange(
  customers: Customer[],
  currentThresholds: number[],
  newThresholds: number[],
  softLanding: boolean,
  weight = 1,
): ThresholdChange {
  const byTier = currentThresholds.map((_, i) => ({ tier: i + 1, members: 0, losing: 0 }))
  let currentMembers = 0
  let losing = 0
  let fallingMoreThanOne = 0
  let caughtBySoftLanding = 0
  let gaining = 0
  for (const c of customers) {
    const before = tierOf(c.spend, currentThresholds)
    const qualified = tierOf(c.spend, newThresholds)
    if (qualified > before) gaining++
    if (before === 0) continue
    currentMembers++
    byTier[before - 1].members++
    const after = landingTier(before, qualified, softLanding)
    if (after < before) {
      losing++
      byTier[before - 1].losing++
      if (before - qualified >= 2) {
        fallingMoreThanOne++
        if (softLanding) caughtBySoftLanding++
      }
    }
  }
  const w = (n: number) => n * weight
  return {
    currentMembers: w(currentMembers),
    losing: w(losing),
    fallingMoreThanOne: w(fallingMoreThanOne),
    caughtBySoftLanding: w(caughtBySoftLanding),
    gaining: w(gaining),
    byTier: byTier.map((t) => ({ tier: t.tier, members: w(t.members), losing: w(t.losing) })),
  }
}

// ─────────────────────────────────────────────────────────────
// Chart data
// ─────────────────────────────────────────────────────────────

export interface HistogramBin {
  from: number
  to: number
  count: number
  extreme: number
}

/** Log-spaced spend bins over [lo, hi]; values outside fall into the first or last bin. */
export function logHistogram(customers: Customer[], flags: boolean[], lo: number, hi: number, binCount = 48): HistogramBin[] {
  const llo = Math.log(lo)
  const span = Math.log(hi) - llo || 1
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    from: Math.exp(llo + (span * i) / binCount),
    to: Math.exp(llo + (span * (i + 1)) / binCount),
    count: 0,
    extreme: 0,
  }))
  customers.forEach((c, i) => {
    const pos = c.spend > 0 ? (Math.log(c.spend) - llo) / span : 0
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor(pos * binCount)))
    if (flags[i]) bins[idx].extreme++
    else bins[idx].count++
  })
  return bins
}
