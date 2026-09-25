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
  /** Share (0–90%) of the member vs non-member gap that would exist without the programme */
  selfSelectionPct: number
  grossMarginPct?: number
  measuredIncremental?: number
}

export interface RoiScenario {
  revenue: {
    frequency: number
    basket: number
    retention: number
    referral: number
    total: number
    source: "calculated" | "measured"
  }
  roi: {
    revenueMultiple: number
    standardRoi: number
    marginRoi: number | undefined
  }
  breakevenMonths: number
}

export interface RoiResult extends RoiScenario {
  activeMembers: number
  baseRevenue: number
  costs: {
    points: number
    total: number
    perActiveMember: number
    asPctOfTotalRevenue: number
  }
  requiredLift: {
    pct: number
    perMember: number
    risk: "low" | "moderate" | "high"
  }
  /** Member vs non-member comparison, as vendors report it. Same as the top-level revenue/roi/breakevenMonths. */
  reported: RoiScenario
  /** Frequency, basket and retention reduced by selfSelectionPct. Equals `reported` for measured data. */
  adjusted: RoiScenario
  selfSelection: {
    pct: number
    applied: boolean
  }
}

export const SELF_SELECTION_RANGE = { min: 0, max: 90 }

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
  selfSelectionPct: 50,
}

const safe = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator

function scenario(revenue: RoiScenario["revenue"], totalCost: number, grossMarginPct: number | undefined): RoiScenario {
  const revenueMultiple = safe(revenue.total, totalCost)
  const standardRoi = totalCost === 0 ? 0 : safe(revenue.total - totalCost, totalCost) * 100
  const marginRoi =
    grossMarginPct !== undefined
      ? safe(revenue.total * (grossMarginPct / 100) - totalCost, totalCost) * 100
      : undefined
  const breakevenMonths = safe(totalCost, safe(revenue.total, 12))
  return { revenue, roi: { revenueMultiple, standardRoi, marginRoi }, breakevenMonths }
}

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
    selfSelectionPct,
    grossMarginPct,
    measuredIncremental,
  } = inputs

  const activeMembers = totalMembers * (activePct / 100)
  const baseRevenue = activeMembers * avgSpend

  const pointsCost = baseRevenue * (pointsCostPct / 100)
  const totalCost = pointsCost + techCost + opsCost + mktCost
  const perActiveMember = safe(totalCost, activeMembers)

  const selfSelection = Number.isFinite(selfSelectionPct)
    ? Math.min(SELF_SELECTION_RANGE.max, Math.max(SELF_SELECTION_RANGE.min, selfSelectionPct))
    : 0

  let reported: RoiScenario
  let adjusted: RoiScenario

  if (measuredIncremental !== undefined) {
    // A control-group measurement already excludes self-selection — no adjustment
    reported = scenario(
      { frequency: 0, basket: 0, retention: 0, referral: 0, total: measuredIncremental, source: "measured" },
      totalCost,
      grossMarginPct,
    )
    adjusted = reported
  } else {
    const frequency = baseRevenue * (freqUplift / 100)
    const basket = baseRevenue * (basketUplift / 100)
    const retention = baseRevenue * (retentionUplift / 100)
    const referral = referralRate * avgSpend
    reported = scenario(
      { frequency, basket, retention, referral, total: frequency + basket + retention + referral, source: "calculated" },
      totalCost,
      grossMarginPct,
    )

    // Only the "vs non-members" components carry self-selection; referral does not
    const keep = 1 - selfSelection / 100
    const adjFrequency = frequency * keep
    const adjBasket = basket * keep
    const adjRetention = retention * keep
    adjusted = scenario(
      {
        frequency: adjFrequency,
        basket: adjBasket,
        retention: adjRetention,
        referral,
        total: adjFrequency + adjBasket + adjRetention + referral,
        source: "calculated",
      },
      totalCost,
      grossMarginPct,
    )
  }

  const requiredLiftPct = safe(totalCost, baseRevenue) * 100
  const requiredLiftPerMember = safe(totalCost, activeMembers)
  const risk: "low" | "moderate" | "high" =
    requiredLiftPct < 3 ? "low" : requiredLiftPct <= 8 ? "moderate" : "high"

  return {
    ...reported,
    activeMembers,
    baseRevenue,
    costs: { points: pointsCost, total: totalCost, perActiveMember, asPctOfTotalRevenue: safe(totalCost, baseRevenue + reported.revenue.total) * 100 },
    requiredLift: { pct: requiredLiftPct, perMember: requiredLiftPerMember, risk },
    reported,
    adjusted,
    selfSelection: { pct: selfSelection, applied: measuredIncremental === undefined && selfSelection > 0 },
  }
}
