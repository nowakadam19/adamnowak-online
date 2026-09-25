import { describe, it, expect } from "vitest"
import {
  approximateCustomers,
  detectExtremes,
  enforceIncreasing,
  fitSigma,
  landingTier,
  logHistogram,
  lognormalTopShare,
  median,
  normCdf,
  normInv,
  planTiers,
  sampleCustomers,
  suggestThresholds,
  thresholdChange,
  topShare,
  complexity,
  DEFAULT_BENEFITS,
  DEFAULT_NAMES,
  SAMPLE_CORPORATE,
  SAMPLE_SIZE,
  type ProgrammeParams,
} from "./tier-calculations"

const params = (overrides: Partial<ProgrammeParams> = {}): ProgrammeParams => ({
  marginPct: 40,
  tierCount: 3,
  thresholds: [300, 800, 2000],
  windowMonths: 12,
  validityYears: 1,
  benefits: DEFAULT_BENEFITS,
  softLanding: true,
  activityKeep: false,
  excludeExtremes: false,
  names: DEFAULT_NAMES,
  ...overrides,
})

// ─────────────────────────────────────────────────────────────
// Normal distribution helpers
// ─────────────────────────────────────────────────────────────
describe("normal distribution", () => {
  it("Φ and Φ⁻¹ match known values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7)
    expect(normCdf(1.959964)).toBeCloseTo(0.975, 6)
    expect(normInv(0.975)).toBeCloseTo(1.959964, 5)
    expect(normInv(0.8)).toBeCloseTo(0.841621, 5)
  })

  it("Φ⁻¹ inverts Φ across the range", () => {
    for (const p of [0.0001, 0.01, 0.2, 0.5, 0.9, 0.9999]) {
      expect(normCdf(normInv(p))).toBeCloseTo(p, 8)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Path A — log-normal fit reproduces the four numbers
// ─────────────────────────────────────────────────────────────
describe("log-normal approximation", () => {
  it("σ = 0 gives an even spread (top 20% hold 20%)", () => {
    expect(lognormalTopShare(0)).toBeCloseTo(0.2, 6)
  })

  it.each([21, 30, 45, 55, 70, 80, 90, 95])("reproduces median and a top-20%% share of %i%% within ±0.5 pp", (share) => {
    const median0 = 300
    const customers = approximateCustomers({ customers: 10_000, medianSpend: median0, top20SharePct: share, purchasesPerYear: 4 })
    expect(customers).toHaveLength(5_000)
    expect(Math.abs(topShare(customers) * 100 - share)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(median(customers.map((c) => c.spend)) / median0 - 1)).toBeLessThanOrEqual(0.005)
  })

  it("the theoretical top share at the fitted σ equals the input", () => {
    for (const share of [25, 60, 85]) expect(lognormalTopShare(fitSigma(share)) * 100).toBeCloseTo(share, 4)
  })

  it("is deterministic", () => {
    const a = approximateCustomers({ customers: 1, medianSpend: 250, top20SharePct: 60, purchasesPerYear: 5 })
    const b = approximateCustomers({ customers: 1, medianSpend: 250, top20SharePct: 60, purchasesPerYear: 5 })
    expect(a).toEqual(b)
  })

  it("purchases follow a fixed typical basket (median ÷ purchases a year)", () => {
    const customers = approximateCustomers({ customers: 1, medianSpend: 300, top20SharePct: 55, purchasesPerYear: 4 })
    for (const c of customers.slice(0, 50)) expect(c.spend / c.purchases).toBeCloseTo(75, 6)
    expect(median(customers.map((c) => c.purchases))).toBeCloseTo(4, 1)
  })
})

// ─────────────────────────────────────────────────────────────
// Tier shares
// ─────────────────────────────────────────────────────────────
describe("tier results", () => {
  const customers = approximateCustomers({ customers: 10_000, medianSpend: 300, top20SharePct: 55, purchasesPerYear: 4 })

  it.each([1, 2, 3, 4])("customer and revenue shares sum to 100%% with %i tiers", (tierCount) => {
    const result = planTiers(customers, params({ tierCount, thresholds: suggestThresholds(customers, tierCount) }))
    expect(result.tiers).toHaveLength(tierCount + 1)
    const customerSum = result.tiers.reduce((s, t) => s + t.customerShare, 0)
    const revenueSum = result.tiers.reduce((s, t) => s + t.revenueShare, 0)
    expect(customerSum).toBeCloseTo(1, 9)
    expect(revenueSum).toBeCloseTo(1, 9)
  })

  it("shares still sum to 100% with extreme customers excluded", () => {
    const result = planTiers(sampleCustomers(), params({ excludeExtremes: true }))
    expect(result.tiers.reduce((s, t) => s + t.customerShare, 0)).toBeCloseTo(1, 9)
    expect(result.tiers.reduce((s, t) => s + t.revenueShare, 0)).toBeCloseTo(1, 9)
  })

  it("discount cost = tier revenue × discount %, shown against tier margin", () => {
    const result = planTiers(customers, params({ tierCount: 1, thresholds: [500], benefits: [{ type: "discount", value: 4 }] }))
    const t1 = result.tiers[1]
    expect(t1.margin).toBeCloseTo(t1.revenue * 0.4, 6)
    expect(t1.benefitCost).toBeCloseTo(t1.revenue * 0.04, 6)
    expect(t1.discountOnExisting).toBeCloseTo(t1.benefitCost, 6)
    expect(t1.benefitCostPctOfMargin).toBeCloseTo(10, 6)
  })

  it("per-member benefit cost = members × € per member", () => {
    const result = planTiers(customers, params({ tierCount: 1, thresholds: [500], benefits: [{ type: "recognition", value: 12 }] }))
    expect(result.tiers[1].benefitCost).toBe(result.tiers[1].customers * 12)
    expect(result.tiers[1].discountOnExisting).toBeNull()
  })

  it("reachability counts purchases between a typical member and the next threshold", () => {
    // Path A: basket = 300 / 4 = €75
    const result = planTiers(customers, params({ tierCount: 1, thresholds: [600] }))
    const reach = result.tiers[0].reach!
    expect(reach.basket).toBeCloseTo(75, 6)
    expect(reach.extraPurchases).toBe(Math.ceil((600 - result.tiers[0].medianSpend) / 75))
    expect(result.tiers[1].reach).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// Thresholds
// ─────────────────────────────────────────────────────────────
describe("thresholds", () => {
  it("are always strictly increasing", () => {
    expect(enforceIncreasing([500, 400, 300, 200], 0)).toEqual([500, 501, 502, 503])
    expect(enforceIncreasing([500, 400, 300, 200], 3)).toEqual([197, 198, 199, 200])
    expect(enforceIncreasing([100, 900, 300, 1200], 1)).toEqual([100, 900, 901, 1200])
    expect(enforceIncreasing([2, 3, 1], 2)).toEqual([1, 2, 3])
  })

  it("suggested thresholds rise for every tier count and both data sets", () => {
    const sets = [sampleCustomers(), approximateCustomers({ customers: 1, medianSpend: 80, top20SharePct: 35, purchasesPerYear: 12 })]
    for (const customers of sets) {
      for (const n of [1, 2, 3, 4]) {
        const t = suggestThresholds(customers, n)
        expect(t).toHaveLength(n)
        for (let i = 1; i < t.length; i++) expect(t[i]).toBeGreaterThan(t[i - 1])
      }
    }
  })

  it("planTiers repairs thresholds given out of order", () => {
    const result = planTiers(sampleCustomers(), params({ thresholds: [900, 300, 2000] }))
    const t = result.tiers.slice(1).map((x) => x.threshold)
    for (let i = 1; i < t.length; i++) expect(t[i]).toBeGreaterThan(t[i - 1])
  })
})

// ─────────────────────────────────────────────────────────────
// Soft landing
// ─────────────────────────────────────────────────────────────
describe("soft landing", () => {
  it("never drops a member by more than one tier", () => {
    for (let current = 0; current <= 4; current++) {
      for (let qualified = 0; qualified <= 4; qualified++) {
        const after = landingTier(current, qualified, true)
        expect(current - after).toBeLessThanOrEqual(1)
        if (qualified >= current) expect(after).toBe(qualified)
      }
    }
  })

  it("without soft landing, members fall to the tier they qualify for", () => {
    expect(landingTier(4, 0, false)).toBe(0)
    expect(landingTier(3, 1, false)).toBe(1)
  })

  it("raising thresholds: counts losers and those caught by soft landing", () => {
    const customers = sampleCustomers()
    const before = [300, 800, 2000]
    const after = [600, 3000, 8000]
    const soft = thresholdChange(customers, before, after, true)
    const hard = thresholdChange(customers, before, after, false)
    expect(soft.losing).toBeGreaterThan(0)
    expect(soft.losing).toBe(hard.losing)
    expect(soft.fallingMoreThanOne).toBe(hard.fallingMoreThanOne)
    expect(soft.caughtBySoftLanding).toBe(soft.fallingMoreThanOne)
    expect(hard.caughtBySoftLanding).toBe(0)
    expect(soft.byTier.reduce((s, t) => s + t.losing, 0)).toBe(soft.losing)
  })

  it("unchanged thresholds: nobody loses status", () => {
    const change = thresholdChange(sampleCustomers(), [300, 800], [300, 800], true)
    expect(change.losing).toBe(0)
    expect(change.gaining).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// Extreme customers
// ─────────────────────────────────────────────────────────────
describe("extreme customers", () => {
  it("sample data: flags exactly the corporate buyers", () => {
    const customers = sampleCustomers()
    expect(customers).toHaveLength(SAMPLE_SIZE)
    const extremes = detectExtremes(customers)
    expect(extremes.count).toBe(SAMPLE_CORPORATE)
    expect(extremes.flags.slice(SAMPLE_SIZE - SAMPLE_CORPORATE).every(Boolean)).toBe(true)
    expect(extremes.revenueShare).toBeGreaterThan(0)
    expect(extremes.revenueShare).toBeLessThan(1)
  })

  it("sample data is deterministic", () => {
    expect(sampleCustomers()).toBe(sampleCustomers())
    expect(sampleCustomers()[0]).toEqual(sampleCustomers()[0])
  })

  it("excluding extremes removes them from the tier population", () => {
    const customers = sampleCustomers()
    const withAll = planTiers(customers, params())
    const without = planTiers(customers, params({ excludeExtremes: true }))
    expect(withAll.population).toBe(SAMPLE_SIZE)
    expect(without.population).toBe(SAMPLE_SIZE - SAMPLE_CORPORATE)
    expect(without.excluded).toBe(SAMPLE_CORPORATE)
    expect(without.totalRevenue).toBeLessThan(withAll.totalRevenue)
  })

  it("percentile shift: mean spend drops without extremes; percentile values do not rise", () => {
    const result = planTiers(sampleCustomers(), params())
    expect(result.percentileShift.meanClean).toBeLessThan(result.percentileShift.meanAll)
    for (const row of result.percentileShift.rows) expect(row.valueWithout).toBeLessThanOrEqual(row.threshold)
  })

  it("an approximated log-normal has no extreme customers", () => {
    const customers = approximateCustomers({ customers: 1, medianSpend: 300, top20SharePct: 55, purchasesPerYear: 4 })
    expect(detectExtremes(customers).count).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// Scaling and chart data
// ─────────────────────────────────────────────────────────────
describe("weight and histogram", () => {
  it("weight scales counts and revenue, leaves shares alone", () => {
    const customers = approximateCustomers({ customers: 20_000, medianSpend: 300, top20SharePct: 55, purchasesPerYear: 4 })
    const one = planTiers(customers, params())
    const four = planTiers(customers, params(), 4)
    expect(four.population).toBe(one.population * 4)
    expect(four.totalRevenue).toBeCloseTo(one.totalRevenue * 4, 4)
    four.tiers.forEach((t, i) => {
      expect(t.customerShare).toBeCloseTo(one.tiers[i].customerShare, 12)
      expect(t.benefitCost).toBeCloseTo(one.tiers[i].benefitCost * 4, 4)
    })
  })

  it("histogram keeps every customer", () => {
    const customers = sampleCustomers()
    const { flags } = detectExtremes(customers)
    const bins = logHistogram(customers, flags, 20, 5_000, 30)
    expect(bins).toHaveLength(30)
    expect(bins.reduce((s, b) => s + b.count + b.extreme, 0)).toBe(customers.length)
    expect(bins.reduce((s, b) => s + b.extreme, 0)).toBe(SAMPLE_CORPORATE)
  })
})

// ─────────────────────────────────────────────────────────────
// Complexity counter
// ─────────────────────────────────────────────────────────────
describe("complexity counter", () => {
  it("counts each mechanism beyond spend more, get more", () => {
    expect(complexity({ windowMonths: 12, softLanding: false, activityKeep: false }).count).toBe(0)
    expect(complexity({ windowMonths: 24, softLanding: false, activityKeep: false }).count).toBe(1)
    expect(complexity({ windowMonths: 12, softLanding: true, activityKeep: false }).count).toBe(1)
    expect(complexity({ windowMonths: 36, softLanding: true, activityKeep: true }).count).toBe(3)
  })
})
