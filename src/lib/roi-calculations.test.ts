import { describe, it, expect } from "vitest"
import { calculate, DEFAULT_INPUTS, type RoiInputs } from "./roi-calculations"

// ─────────────────────────────────────────────────────────────
// Helper: round to N decimal places for float comparisons
// ─────────────────────────────────────────────────────────────
const r = (n: number, decimals = 2) =>
  Math.round(n * 10 ** decimals) / 10 ** decimals

// ─────────────────────────────────────────────────────────────
// Test case 1 — minimal, hand-verifiable inputs
// ─────────────────────────────────────────────────────────────
// totalMembers: 1000, activePct: 50  → activeMembers: 500
// avgSpend: 1000                     → baseRevenue: 500,000
//
// pointsCostPct: 2, all other costs: 0
//                                    → pointsCost: 10,000
//                                    → totalCost: 10,000
//
// freqUplift: 10, rest: 0, referralRate: 0
//                                    → freqRev: 50,000
//                                    → incrementalRevenue: 50,000
//
// revenueMultiple: 50,000 / 10,000 = 5.00
// standardRoi: (50,000 − 10,000) / 10,000 × 100 = 400%
// requiredLiftPct: 10,000 / 500,000 × 100 = 2%
// requiredLiftPerMember: 10,000 / 500 = 20
// breakevenMonths: 10,000 / (50,000/12) = 2.4
// ─────────────────────────────────────────────────────────────

const BASE: RoiInputs = {
  totalMembers: 1_000,
  activePct: 50,
  avgSpend: 1_000,
  pointsCostPct: 2,
  techCost: 0,
  opsCost: 0,
  mktCost: 0,
  freqUplift: 10,
  basketUplift: 0,
  retentionUplift: 0,
  referralRate: 0,
}

describe("Test 1 — base case (hand-verified)", () => {
  const result = calculate(BASE)

  it("activeMembers", () => expect(result.activeMembers).toBe(500))
  it("baseRevenue", () => expect(result.baseRevenue).toBe(500_000))
  it("revenue.frequency", () => expect(result.revenue.frequency).toBe(50_000))
  it("revenue.total", () => expect(result.revenue.total).toBe(50_000))
  it("revenue.source", () => expect(result.revenue.source).toBe("calculated"))
  it("costs.points", () => expect(result.costs.points).toBe(10_000))
  it("costs.total", () => expect(result.costs.total).toBe(10_000))
  it("costs.perActiveMember", () => expect(result.costs.perActiveMember).toBe(20))
  it("roi.revenueMultiple", () => expect(result.roi.revenueMultiple).toBe(5))
  it("roi.standardRoi", () => expect(result.roi.standardRoi).toBe(400))
  it("roi.marginRoi undefined when no margin given", () =>
    expect(result.roi.marginRoi).toBeUndefined())
  it("requiredLift.pct", () => expect(result.requiredLift.pct).toBe(2))
  it("requiredLift.perMember", () => expect(result.requiredLift.perMember).toBe(20))
  it("requiredLift.risk → low (< 3%)", () =>
    expect(result.requiredLift.risk).toBe("low"))
  it("breakevenMonths", () => expect(r(result.breakevenMonths)).toBe(2.4))
})

// ─────────────────────────────────────────────────────────────
// Test case 2 — all four uplift sources active + referral
// ─────────────────────────────────────────────────────────────
// baseRevenue: 500,000 (same as above)
// freqRev:   500,000 × 0.10 = 50,000
// basketRev: 500,000 × 0.05 = 25,000
// retRev:    500,000 × 0.08 = 40,000
// referral:  100 × 1,000    = 100,000
// total incremental: 215,000
// ─────────────────────────────────────────────────────────────

describe("Test 2 — all uplift sources", () => {
  const inputs: RoiInputs = {
    ...BASE,
    basketUplift: 5,
    retentionUplift: 8,
    referralRate: 100,
  }
  const result = calculate(inputs)

  it("revenue.basket", () => expect(result.revenue.basket).toBe(25_000))
  it("revenue.retention", () => expect(result.revenue.retention).toBe(40_000))
  it("revenue.referral", () => expect(result.revenue.referral).toBe(100_000))
  it("revenue.total", () => expect(result.revenue.total).toBe(215_000))
  it("roi.revenueMultiple", () => expect(result.roi.revenueMultiple).toBe(21.5))
  it("roi.standardRoi", () => expect(result.roi.standardRoi).toBe(2050))
})

// ─────────────────────────────────────────────────────────────
// Test case 3 — Margin ROI
// ─────────────────────────────────────────────────────────────
// incrementalRevenue: 50,000, totalCost: 10,000, margin: 40%
// marginRoi = (50,000 × 0.40 − 10,000) / 10,000 × 100
//           = (20,000 − 10,000) / 10,000 × 100
//           = 100%
// ─────────────────────────────────────────────────────────────

describe("Test 3 — Margin ROI", () => {
  const result = calculate({ ...BASE, grossMarginPct: 40 })

  it("marginRoi = 100%", () => expect(result.roi.marginRoi).toBe(100))
  it("standardRoi unchanged", () => expect(result.roi.standardRoi).toBe(400))
})

// ─────────────────────────────────────────────────────────────
// Test case 4 — Measured incremental override
// ─────────────────────────────────────────────────────────────
// measuredIncremental overrides calculated value (50,000)
// New incremental: 80,000
// revenueMultiple: 80,000 / 10,000 = 8
// standardRoi: (80,000 − 10,000) / 10,000 × 100 = 700%
// ─────────────────────────────────────────────────────────────

describe("Test 4 — measured incremental override", () => {
  const result = calculate({ ...BASE, measuredIncremental: 80_000 })

  it("revenue.total = 80,000", () => expect(result.revenue.total).toBe(80_000))
  it("revenue.source = measured", () =>
    expect(result.revenue.source).toBe("measured"))
  it("revenue.frequency = 0 (not used when measured)", () =>
    expect(result.revenue.frequency).toBe(0))
  it("roi.revenueMultiple = 8", () => expect(result.roi.revenueMultiple).toBe(8))
  it("roi.standardRoi = 700%", () => expect(result.roi.standardRoi).toBe(700))
})

// ─────────────────────────────────────────────────────────────
// Test case 5 — Required lift risk levels
// ─────────────────────────────────────────────────────────────
// risk = totalCost / baseRevenue × 100
// low:      < 3%  → very defensible
// moderate: 3–8%  → achievable
// high:     > 8%  → needs strong evidence

describe("Test 5 — required lift risk classification", () => {
  // requiredLift = totalCost / baseRevenue
  // baseRevenue = 500,000 (same base)

  it("risk = low when cost = 2% of base", () => {
    // totalCost = 10,000, base = 500,000 → 2% → low
    const r = calculate(BASE)
    expect(r.requiredLift.risk).toBe("low")
  })

  it("risk = moderate when cost = 5% of base", () => {
    // need totalCost = 25,000 → pointsCostPct drives: 500,000 × 0.05 = 25,000
    const r = calculate({ ...BASE, pointsCostPct: 5 })
    expect(r.requiredLift.risk).toBe("moderate")
  })

  it("risk = high when cost = 10% of base", () => {
    // need totalCost = 50,000 → pointsCostPct = 10%
    const r = calculate({ ...BASE, pointsCostPct: 10 })
    expect(r.requiredLift.risk).toBe("high")
  })
})

// ─────────────────────────────────────────────────────────────
// Test case 6 — Edge cases: zeroes, no NaN / Infinity
// ─────────────────────────────────────────────────────────────

describe("Test 6 — edge cases, no NaN or Infinity", () => {
  it("zero total members → no crash", () => {
    const result = calculate({ ...BASE, totalMembers: 0 })
    expect(result.activeMembers).toBe(0)
    expect(result.baseRevenue).toBe(0)
    expect(isFinite(result.roi.revenueMultiple)).toBe(true)
    expect(isFinite(result.roi.standardRoi)).toBe(true)
    expect(isFinite(result.costs.perActiveMember)).toBe(true)
    expect(isFinite(result.requiredLift.pct)).toBe(true)
    expect(isFinite(result.breakevenMonths)).toBe(true)
  })

  it("zero costs → ROI returns 0 (not Infinity)", () => {
    const result = calculate({
      ...BASE,
      pointsCostPct: 0,
      techCost: 0,
      opsCost: 0,
      mktCost: 0,
    })
    expect(result.costs.total).toBe(0)
    expect(result.roi.revenueMultiple).toBe(0)
    expect(result.roi.standardRoi).toBe(0)
    expect(result.breakevenMonths).toBe(0)
  })

  it("zero uplift and zero referral → zero incremental revenue", () => {
    const result = calculate({
      ...BASE,
      freqUplift: 0,
      basketUplift: 0,
      retentionUplift: 0,
      referralRate: 0,
    })
    expect(result.revenue.total).toBe(0)
    expect(result.breakevenMonths).toBe(0)
  })

  it("DEFAULT_INPUTS produce finite, positive results", () => {
    const result = calculate(DEFAULT_INPUTS)
    expect(result.activeMembers).toBeGreaterThan(0)
    expect(result.revenue.total).toBeGreaterThan(0)
    expect(result.costs.total).toBeGreaterThan(0)
    expect(isFinite(result.roi.standardRoi)).toBe(true)
    expect(isFinite(result.breakevenMonths)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// Test case 7 — All fixed costs with no points cost
// ─────────────────────────────────────────────────────────────
// pointsCostPct: 0, techCost: 50,000, opsCost: 30,000, mktCost: 20,000
// totalCost: 100,000
// requiredLift: 100,000 / 500,000 × 100 = 20%  → high risk
// ─────────────────────────────────────────────────────────────

describe("Test 7 — fixed costs only", () => {
  const inputs: RoiInputs = {
    ...BASE,
    pointsCostPct: 0,
    techCost: 50_000,
    opsCost: 30_000,
    mktCost: 20_000,
  }
  const result = calculate(inputs)

  it("costs.points = 0", () => expect(result.costs.points).toBe(0))
  it("costs.total = 100,000", () => expect(result.costs.total).toBe(100_000))
  it("requiredLift.pct = 20%", () => expect(result.requiredLift.pct).toBe(20))
  it("requiredLift.risk = high", () => expect(result.requiredLift.risk).toBe("high"))
  it("costs.perActiveMember = 200", () =>
    expect(result.costs.perActiveMember).toBe(200))
})
