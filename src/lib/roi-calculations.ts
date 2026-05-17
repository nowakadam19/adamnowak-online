export interface RoiInputs {
  totalMembers: number
  activePct: number
  avgSpend: number
  pointsCostPct: number
  techCost: number
  opsCost: number
  mktCost: number
  freqUplift: number
  basketUplift: number
  retentionUplift: number
  referralRate: number
  grossMarginPct?: number
  measuredIncremental?: number
}

export interface RoiResult {
  activeMembers: number
  baseRevenue: number
  revenue: {
    frequency: number
    basket: number
    retention: number
    referral: number
    total: number
    source: "calculated" | "measured"
  }
  costs: {
    points: number
    total: number
    perActiveMember: number
    asPctOfTotalRevenue: number
  }
  roi: {
    revenueMultiple: number
    standardRoi: number
    marginRoi: number | undefined
  }
  requiredLift: {
    pct: number
    perMember: number
    risk: "low" | "moderate" | "high"
  }
  breakevenMonths: number
}

export const ROI_BENCHMARK = { low: 200, high: 400 }
export const INDUSTRY_UPLIFT_RANGE = { low: 5, high: 20 }

export const DEFAULT_INPUTS: RoiInputs = {
  totalMembers: 5_000,
  activePct: 40,
  avgSpend: 500,
  pointsCostPct: 2,
  techCost: 10_000,
  opsCost: 5_000,
  mktCost: 5_000,
  freqUplift: 10,
  basketUplift: 5,
  retentionUplift: 3,
  referralRate: 50,
}

const safe = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator

export function calculate(inputs: RoiInputs): RoiResult {
  const {
    totalMembers,
    activePct,
    avgSpend,
    pointsCostPct,
    techCost,
    opsCost,
    mktCost,
    freqUplift,
    basketUplift,
    retentionUplift,
    referralRate,
    grossMarginPct,
    measuredIncremental,
  } = inputs

  const activeMembers = totalMembers * (activePct / 100)
  const baseRevenue = activeMembers * avgSpend

  const pointsCost = baseRevenue * (pointsCostPct / 100)
  const totalCost = pointsCost + techCost + opsCost + mktCost
  const perActiveMember = safe(totalCost, activeMembers)

  let revenue: RoiResult["revenue"]

  if (measuredIncremental !== undefined) {
    revenue = {
      frequency: 0,
      basket: 0,
      retention: 0,
      referral: 0,
      total: measuredIncremental,
      source: "measured",
    }
  } else {
    const frequency = baseRevenue * (freqUplift / 100)
    const basket = baseRevenue * (basketUplift / 100)
    const retention = baseRevenue * (retentionUplift / 100)
    const referral = referralRate * avgSpend
    revenue = {
      frequency,
      basket,
      retention,
      referral,
      total: frequency + basket + retention + referral,
      source: "calculated",
    }
  }

  const revenueMultiple = safe(revenue.total, totalCost)
  const standardRoi = totalCost === 0 ? 0 : safe(revenue.total - totalCost, totalCost) * 100
  const marginRoi =
    grossMarginPct !== undefined
      ? safe(revenue.total * (grossMarginPct / 100) - totalCost, totalCost) * 100
      : undefined

  const requiredLiftPct = safe(totalCost, baseRevenue) * 100
  const requiredLiftPerMember = safe(totalCost, activeMembers)
  const risk: "low" | "moderate" | "high" =
    requiredLiftPct < 3 ? "low" : requiredLiftPct <= 8 ? "moderate" : "high"

  const breakevenMonths = safe(totalCost, safe(revenue.total, 12))

  return {
    activeMembers,
    baseRevenue,
    revenue,
    costs: { points: pointsCost, total: totalCost, perActiveMember, asPctOfTotalRevenue: safe(totalCost, baseRevenue + revenue.total) * 100 },
    roi: { revenueMultiple, standardRoi, marginRoi },
    requiredLift: { pct: requiredLiftPct, perMember: requiredLiftPerMember, risk },
    breakevenMonths,
  }
}
