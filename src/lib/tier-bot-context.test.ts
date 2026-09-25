import { describe, it, expect } from "vitest"
import {
  buildTierBotContext,
  checkTierBotContext,
  distributionSummary,
  CONTEXT_MAX_CHARS,
  type TierBotContext,
  type TierBotSource,
} from "./tier-bot-context"
import {
  approximateCustomers,
  mulberry32,
  planTiers,
  sampleCustomers,
  suggestThresholds,
  thresholdChange,
  APPROX_SAMPLE_SIZE,
  DEFAULT_APPROX,
  DEFAULT_BENEFITS,
  DEFAULT_NAMES,
  type Customer,
  type ProgrammeParams,
} from "./tier-calculations"
import { parseCustomerCsv, type CsvSuccess } from "./tier-csv"

const params = (overrides: Partial<ProgrammeParams> = {}): ProgrammeParams => ({
  marginPct: 40,
  tierCount: 2,
  thresholds: [300, 800],
  windowMonths: 12,
  validityYears: 1,
  benefits: DEFAULT_BENEFITS,
  softLanding: true,
  activityKeep: false,
  excludeExtremes: false,
  names: DEFAULT_NAMES,
  ...overrides,
})

function contextFor(customers: Customer[], p: ProgrammeParams, source: TierBotSource = "csv", weight = 1, current: number[] | null = null) {
  const result = planTiers(customers, p, weight)
  const change = current ? thresholdChange(customers, current, p.thresholds, p.softLanding, weight) : null
  return buildTierBotContext({ source, params: p, result, distribution: distributionSummary(customers), change, currentThresholds: current })
}

/** CSV text with an identifying customer_id column and spend values with cents. */
function bigCsv(rows: number, seed = 7): string {
  const rand = mulberry32(seed)
  const lines = ["customer_id,annual_spend,purchases"]
  for (let i = 0; i < rows; i++) {
    const purchases = 1 + Math.floor(rand() * 12)
    const spend = (purchases * (20 + rand() * 80)).toFixed(2)
    lines.push(`CUST-${String(i).padStart(6, "0")},${spend},${purchases}`)
  }
  return lines.join("\n")
}

const parsed = (text: string): CsvSuccess => {
  const r = parseCustomerCsv(text)
  if (!r.ok) throw new Error(r.message)
  return r
}

/** Every array and every number in the payload, however deep. */
function walk(v: unknown, arrays: unknown[][] = [], numbers: number[] = []) {
  if (Array.isArray(v)) { arrays.push(v); v.forEach((x) => walk(x, arrays, numbers)) }
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walk(x, arrays, numbers))
  else if (typeof v === "number") numbers.push(v)
  return { arrays, numbers }
}

/** Key structure of an object, ignoring values: two payloads of the same shape give the same string. */
function shape(v: unknown): unknown {
  if (Array.isArray(v)) return v.length ? [shape(v[0])] : []
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape((v as Record<string, unknown>)[k])]))
  return v === null ? "null" : typeof v
}

describe("buildTierBotContext — never customer rows", () => {
  const big = parsed(bigCsv(60_000))
  const small = parsed(bigCsv(40, 11))
  const p = params({ tierCount: 3, thresholds: suggestThresholds(big.customers, 3) })
  const bigCtx = contextFor(big.customers, p, "csv", big.validRows / big.customers.length, [200, 600, 1500])
  const smallCtx = contextFor(small.customers, p, "csv", 1, [200, 600, 1500])
  const json = JSON.stringify(bigCtx)

  it("uses a sampled file above the row limit (test precondition)", () => {
    expect(big.sampled).toBe(true)
    expect(big.customers.length).toBe(50_000)
  })

  it("stays a small summary: a few kB whatever the number of rows", () => {
    expect(json.length).toBeLessThan(5_000)
    expect(Math.abs(json.length - JSON.stringify(smallCtx).length)).toBeLessThan(300)
  })

  it("has the same shape for a 40-row and a 60,000-row file", () => {
    expect(shape(bigCtx)).toEqual(shape(smallCtx))
    expect(Object.keys(bigCtx).sort()).toEqual(["change", "complexity", "data", "distribution", "extremes", "programme", "tiers"])
  })

  it("has no array longer than the number of tiers", () => {
    const { arrays } = walk(bigCtx)
    expect(Math.max(...arrays.map((a) => a.length))).toBeLessThanOrEqual(5)
    expect(bigCtx.tiers).toHaveLength(4)
  })

  it("carries no identifiers, file data or per-customer flags", () => {
    expect(json).not.toMatch(/CUST-/)
    expect(json).not.toMatch(/\.csv/i)
    expect(json).not.toMatch(/flags|customer_id|annual_spend/)
  })

  it("contains no raw spend value: every number is rounded to at most one decimal", () => {
    const { numbers } = walk(bigCtx)
    for (const n of numbers) expect(Math.round(n * 10) / 10).toBe(n)
    // A raw spend from the file, with cents, is nowhere in the text
    expect(json).not.toContain(big.customers[123].spend.toFixed(2))
  })

  it("scales counts back to the whole file", () => {
    expect(bigCtx.data.customers).toBe(60_000)
    expect(bigCtx.tiers.reduce((s, t) => s + t.customers, 0)).toBeCloseTo(60_000, -1)
  })

  it("passes the server-side check", () => {
    expect(checkTierBotContext(bigCtx)).toBeNull()
    expect(checkTierBotContext(smallCtx)).toBeNull()
  })
})

describe("buildTierBotContext — content", () => {
  it("describes each tier, the programme and the complexity counter", () => {
    const p = params({ windowMonths: 24, activityKeep: true, benefits: [{ type: "discount", value: 3 }, { type: "recognition", value: 15 }] })
    const ctx = contextFor(sampleCustomers(), p, "sample")
    expect(ctx.programme).toEqual({
      grossMarginPct: 40, tiersAboveBase: 2, qualificationWindowMonths: 24, statusValidityYears: 1,
      softLanding: true, activityKeepsStatus: true, excludeExtremeCustomers: false,
    })
    expect(ctx.complexity.rulesToExplain).toBe(3)
    expect(ctx.complexity.mechanisms).toHaveLength(3)
    const [base, t1, t2] = ctx.tiers
    expect(base.benefit).toBeNull()
    expect(base.reach?.to).toBe("Tier 1")
    expect(t1.benefit).toBe("3% discount")
    expect(t1.discountOnExistingPurchasesEur).toBe(t1.benefitCostEur)
    expect(t2.benefit).toBe("recognition, €15 per member a year")
    expect(t2.reach).toBeNull()
    const share = ctx.tiers.reduce((s, t) => s + t.customersPct, 0)
    expect(share).toBeCloseTo(100, 0)
    expect(ctx.data.source).toBe("sample")
    expect(ctx.extremes.customers).toBe(18)
    expect(ctx.change).toBeNull()
  })

  it("follows the settings: a moved threshold changes the payload", () => {
    const customers = sampleCustomers()
    const before = contextFor(customers, params({ thresholds: [300, 800] }), "sample")
    const after = contextFor(customers, params({ thresholds: [300, 2000] }), "sample")
    expect(after.tiers[2].fromEur).toBe(2000)
    expect(after.tiers[2].customersPct).toBeLessThan(before.tiers[2].customersPct)
  })

  it("path A: counts use the typed number of customers", () => {
    const customers = approximateCustomers(DEFAULT_APPROX)
    const ctx = contextFor(customers, params(), "approximation", DEFAULT_APPROX.customers / APPROX_SAMPLE_SIZE)
    expect(ctx.data.customers).toBe(DEFAULT_APPROX.customers)
    expect(ctx.distribution.medianAnnualSpendEur).toBe(DEFAULT_APPROX.medianSpend)
    expect(ctx.distribution.top20RevenueSharePct).toBeCloseTo(DEFAULT_APPROX.top20SharePct, 0)
  })

  it("turns infinite values into null, so the JSON stays valid", () => {
    const customers: Customer[] = [{ spend: 10, purchases: 0 }, { spend: 20, purchases: 0 }]
    const ctx = contextFor(customers, params({ thresholds: [100, 200] }))
    expect(ctx.tiers[0].reach?.extraPurchasesPerYear).toBeNull()
    expect(JSON.parse(JSON.stringify(ctx))).toEqual(ctx)
  })
})

describe("distributionSummary", () => {
  it("measures how far the top groups sit above the median (rule 16)", () => {
    // 90 customers at €100, 10 at €1,000: top 10% spend 10× the median
    const customers = [...Array(90).fill({ spend: 100, purchases: 2 }), ...Array(10).fill({ spend: 1_000, purchases: 10 })]
    const d = distributionSummary(customers)
    expect(d.medianAnnualSpendEur).toBe(100)
    expect(d.medianPurchasesPerYear).toBe(2)
    expect(d.top10MeanSpendToMedian).toBe(10)
    expect(d.top20MeanSpendToMedian).toBe(5.5)
    expect(d.top20RevenueSharePct).toBeCloseTo((11_000 / 19_000) * 100, 1)
  })

  it("gives zeros for no customers", () => {
    expect(distributionSummary([])).toEqual({
      medianAnnualSpendEur: 0, medianPurchasesPerYear: 0, top20RevenueSharePct: 0, top10MeanSpendToMedian: 0, top20MeanSpendToMedian: 0,
    })
  })
})

describe("checkTierBotContext", () => {
  const ctx: TierBotContext = contextFor(sampleCustomers(), params(), "sample")

  it("rejects a missing or non-object context", () => {
    expect(checkTierBotContext(undefined)).not.toBeNull()
    expect(checkTierBotContext("text")).not.toBeNull()
    expect(checkTierBotContext([])).not.toBeNull()
  })

  it("rejects customer rows smuggled into the payload", () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ spend: i * 10.5, purchases: 2 }))
    expect(checkTierBotContext({ ...ctx, rows })).not.toBeNull()
    expect(checkTierBotContext({ ...ctx, tiers: [...ctx.tiers, ...rows] })).not.toBeNull()
    expect(checkTierBotContext({ ...ctx, data: { ...ctx.data, customers: rows } })).not.toBeNull()
  })

  it("rejects an oversized payload and long strings", () => {
    expect(checkTierBotContext({ ...ctx, data: { ...ctx.data, note: "x".repeat(CONTEXT_MAX_CHARS) } })).not.toBeNull()
    expect(checkTierBotContext({ ...ctx, data: { ...ctx.data, note: "x".repeat(301) } })).not.toBeNull()
  })
})
