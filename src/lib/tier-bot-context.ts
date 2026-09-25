// What the Tier Planner bot sees in every turn: aggregates calculated by the tool, never
// customer rows, file names or anything that could identify a single customer.
import {
  quantileSorted,
  sortAscending,
  type Benefit,
  type Customer,
  type PlannerResult,
  type ProgrammeParams,
  type ThresholdChange,
} from "./tier-calculations"

export type TierBotSource = "approximation" | "sample" | "csv"

export interface TierBotReach {
  to: string
  extraPurchasesPerYear: number | null
  purchasesPerYearToday: number
  typicalBasketEur: number
  monthsAtTodaysPace: number | null
  withinQualificationWindow: boolean
  nearNextThresholdPct: number
}

export interface TierBotTier {
  name: string
  fromEur: number
  customersPct: number
  customers: number
  revenuePct: number
  tierMarginEur: number
  benefit: string | null
  benefitCostEur: number
  benefitCostPctOfTierMargin: number
  discountOnExistingPurchasesEur: number | null
  medianSpendEur: number
  medianPurchasesPerYear: number
  reach: TierBotReach | null
}

export interface TierBotContext {
  data: { source: TierBotSource; customers: number; note: string }
  programme: {
    grossMarginPct: number
    tiersAboveBase: number
    qualificationWindowMonths: number
    statusValidityYears: number
    softLanding: boolean
    activityKeepsStatus: boolean
    excludeExtremeCustomers: boolean
  }
  complexity: { rulesToExplain: number; mechanisms: string[] }
  distribution: {
    medianAnnualSpendEur: number
    medianPurchasesPerYear: number
    top20RevenueSharePct: number
    top10MeanSpendToMedian: number
    top20MeanSpendToMedian: number
  }
  tiers: TierBotTier[]
  extremes: {
    customers: number
    customersPct: number
    revenuePct: number
    limitEur: number | null
    excludedFromResults: boolean
    meanSpendWithEur: number
    meanSpendWithoutEur: number
    thresholds: { tier: string; thresholdEur: number; percentileOfAll: number; samePercentileWithoutExtremesEur: number }[]
  }
  change: {
    currentThresholdsEur: number[]
    currentMembers: number
    wouldLoseStatusAtPeriodEnd: number
    caughtBySoftLanding: number
    fallingMoreThanOneTier: number
    reachingHigherTier: number
  } | null
}

/** Spend-distribution figures for rule 16 (frequency, differentiation). Depends on customers only. */
export type TierBotDistribution = TierBotContext["distribution"]

const pct = (share: number) => Math.round(share * 1000) / 10
const eur = (n: number) => Math.round(n)
const one = (n: number) => Math.round(n * 10) / 10
const finite = (n: number, round: (n: number) => number) => (Number.isFinite(n) ? round(n) : null)

const SOURCE_NOTES: Record<TierBotSource, string> = {
  approximation: "Approximated from four numbers the visitor typed (log-normal). Every customer is assumed to buy the same typical basket. Real data often has a longer tail.",
  sample: "Built-in fictional sample data, including 18 corporate buyers who spend far more than anyone else.",
  csv: "The visitor's own uploaded data, read in their browser only.",
}

function describeBenefit(b: Benefit): string {
  if (b.type === "discount") return `${b.value}% discount`
  return `${b.type === "operational" ? "operational" : "recognition"}, €${b.value} per member a year`
}

export function distributionSummary(customers: Customer[]): TierBotDistribution {
  const spend = sortAscending(customers.map((c) => c.spend))
  const purchases = sortAscending(customers.map((c) => c.purchases))
  const n = spend.length
  const med = quantileSorted(spend, 0.5)
  let total = 0
  for (let i = 0; i < n; i++) total += spend[i]
  const topMean = (p: number) => {
    const k = Math.max(1, Math.round(n * p))
    let s = 0
    for (let i = n - k; i < n; i++) s += spend[i]
    return { sum: s, mean: s / k }
  }
  const top10 = topMean(0.1)
  const top20 = topMean(0.2)
  return {
    medianAnnualSpendEur: eur(med),
    medianPurchasesPerYear: one(quantileSorted(purchases, 0.5)),
    top20RevenueSharePct: n && total ? pct(top20.sum / total) : 0,
    top10MeanSpendToMedian: n && med > 0 ? one(top10.mean / med) : 0,
    top20MeanSpendToMedian: n && med > 0 ? one(top20.mean / med) : 0,
  }
}

export interface TierBotInput {
  source: TierBotSource
  params: ProgrammeParams
  result: PlannerResult
  distribution: TierBotDistribution
  change: ThresholdChange | null
  currentThresholds: number[] | null
}

export function buildTierBotContext({ source, params, result, distribution, change, currentThresholds }: TierBotInput): TierBotContext {
  const tiers = result.tiers.map((t): TierBotTier => ({
    name: t.name,
    fromEur: eur(t.threshold),
    customersPct: pct(t.customerShare),
    customers: eur(t.customers),
    revenuePct: pct(t.revenueShare),
    tierMarginEur: eur(t.margin),
    benefit: t.benefit ? describeBenefit(t.benefit) : null,
    benefitCostEur: eur(t.benefitCost),
    benefitCostPctOfTierMargin: one(t.benefitCostPctOfMargin),
    discountOnExistingPurchasesEur: t.discountOnExisting === null ? null : eur(t.discountOnExisting),
    medianSpendEur: eur(t.medianSpend),
    medianPurchasesPerYear: one(t.medianPurchases),
    reach: t.reach ? {
      to: result.tiers[t.reach.nextTier]?.name ?? "",
      extraPurchasesPerYear: finite(t.reach.extraPurchases, eur),
      purchasesPerYearToday: one(t.reach.currentPurchases),
      typicalBasketEur: eur(t.reach.basket),
      monthsAtTodaysPace: finite(t.reach.monthsAtPace, eur),
      withinQualificationWindow: t.reach.withinWindow,
      nearNextThresholdPct: pct(t.reach.nearShare),
    } : null,
  }))

  const ex = result.extremes
  return {
    data: { source, customers: eur(result.population), note: SOURCE_NOTES[source] },
    programme: {
      grossMarginPct: params.marginPct,
      tiersAboveBase: result.tiers.length - 1,
      qualificationWindowMonths: params.windowMonths,
      statusValidityYears: params.validityYears,
      softLanding: params.softLanding,
      activityKeepsStatus: params.activityKeep,
      excludeExtremeCustomers: params.excludeExtremes,
    },
    complexity: { rulesToExplain: result.complexity.count, mechanisms: result.complexity.mechanisms },
    distribution,
    tiers,
    extremes: {
      customers: eur(ex.count),
      customersPct: pct(ex.customerShare),
      revenuePct: pct(ex.revenueShare),
      limitEur: finite(ex.limit, eur),
      excludedFromResults: params.excludeExtremes && result.excluded > 0,
      meanSpendWithEur: eur(result.percentileShift.meanAll),
      meanSpendWithoutEur: eur(result.percentileShift.meanClean),
      thresholds: result.percentileShift.rows.map((row) => ({
        tier: result.tiers[row.tier]?.name ?? `Tier ${row.tier}`,
        thresholdEur: eur(row.threshold),
        percentileOfAll: Math.round(row.percentile * 100),
        samePercentileWithoutExtremesEur: eur(row.valueWithout),
      })),
    },
    change: change && currentThresholds ? {
      currentThresholdsEur: currentThresholds.map(eur),
      currentMembers: eur(change.currentMembers),
      wouldLoseStatusAtPeriodEnd: eur(change.losing),
      caughtBySoftLanding: eur(change.caughtBySoftLanding),
      fallingMoreThanOneTier: eur(change.fallingMoreThanOne),
      reachingHigherTier: eur(change.gaining),
    } : null,
  }
}

// ─────────────────────────────────────────────────────────────
// Server-side guard: whatever the client sends, it must be a small summary
// ─────────────────────────────────────────────────────────────

export const CONTEXT_MAX_CHARS = 8_000
const CONTEXT_KEYS = ["data", "programme", "complexity", "distribution", "tiers", "extremes", "change"]
const MAX_ARRAY = 10
const MAX_STRING = 300

/** Returns an error message, or null when the context is a plausible summary (no rows can fit). */
export function checkTierBotContext(ctx: unknown): string | null {
  if (!ctx || typeof ctx !== "object" || Array.isArray(ctx)) return "Missing context"
  const keys = Object.keys(ctx)
  if (keys.some((k) => !CONTEXT_KEYS.includes(k)) || !Array.isArray((ctx as { tiers?: unknown }).tiers)) return "Unexpected context shape"
  if (JSON.stringify(ctx).length > CONTEXT_MAX_CHARS) return "Context too large"
  const walk = (v: unknown, depth: number): boolean => {
    if (depth > 5) return false
    if (typeof v === "string") return v.length <= MAX_STRING
    if (Array.isArray(v)) return v.length <= MAX_ARRAY && v.every((x) => walk(x, depth + 1))
    if (v && typeof v === "object") return Object.values(v).every((x) => walk(x, depth + 1))
    return true
  }
  return walk(ctx, 0) ? null : "Unexpected context shape"
}
