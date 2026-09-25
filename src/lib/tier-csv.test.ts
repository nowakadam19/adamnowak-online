import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  checkCsvFile,
  checkCsvRow,
  csvSampleSentence,
  csvSummarySentence,
  forEachCsvRow,
  matchCsvHeader,
  parseCsvNumber,
  parseCustomerCsv,
  CSV_ROW_LIMIT,
  type CsvResult,
  type CsvSuccess,
} from "./tier-csv"
import {
  median,
  mulberry32,
  planTiers,
  suggestThresholds,
  topShare,
  DEFAULT_BENEFITS,
  DEFAULT_NAMES,
  type ProgrammeParams,
} from "./tier-calculations"

const ok = (r: CsvResult): CsvSuccess => {
  if (!r.ok) throw new Error(`Expected success, got: ${r.message}`)
  return r
}

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

// ─────────────────────────────────────────────────────────────
// Template and low-level parsing
// ─────────────────────────────────────────────────────────────
describe("template", () => {
  it("the downloadable template parses with no skipped rows", () => {
    const text = readFileSync(join(__dirname, "../../public/loyalty-tier-planner-template.csv"), "utf8")
    const r = ok(parseCustomerCsv(text))
    expect(r.validRows).toBeGreaterThanOrEqual(2)
    expect(r.skippedTotal).toBe(0)
    expect(text.split("\n")[0]).toBe("annual_spend,purchases,customer_id")
  })
})

describe("CSV rows", () => {
  const rowsOf = (text: string) => {
    const out: string[][] = []
    forEachCsvRow(text, (f) => { out.push(f) })
    return out
  }

  it("splits on commas and both line endings", () => {
    expect(rowsOf("a,b\r\n1,2\n3,4")).toEqual([["a", "b"], ["1", "2"], ["3", "4"]])
  })

  it("keeps commas, quotes and line breaks inside quoted fields", () => {
    expect(rowsOf('a,b\n"1,5","say ""hi"""\n"x\ny",2\n')).toEqual([["a", "b"], ["1,5", 'say "hi"'], ["x\ny", "2"]])
  })

  it("reads plain decimal numbers only", () => {
    expect(parseCsvNumber(" 120.50 ")).toBe(120.5)
    expect(parseCsvNumber("-3")).toBe(-3)
    expect(parseCsvNumber("1e3")).toBe(1000)
    for (const bad of ["", "  ", "abc", "NaN", "Infinity", "€120", "1,200", "12 00", "0x10", undefined]) {
      expect(parseCsvNumber(bad)).toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Header matching (decision 25.09: exact names only)
// ─────────────────────────────────────────────────────────────
describe("header matching", () => {
  it("accepts any column order", () => {
    expect(matchCsvHeader(["customer_id", "purchases", "annual_spend"])).toEqual({ spend: 2, purchases: 1 })
    const r = ok(parseCustomerCsv("purchases,customer_id,annual_spend\n4,C1,200\n"))
    expect(r.customers).toEqual([{ spend: 200, purchases: 4 }])
  })

  it("ignores case, surrounding spaces, quotes and a byte-order mark", () => {
    expect(matchCsvHeader(["﻿ Annual_Spend ", "PURCHASES"])).toEqual({ spend: 0, purchases: 1 })
    expect(ok(parseCustomerCsv('﻿"ANNUAL_SPEND", "Purchases"\n10,1')).validRows).toBe(1)
  })

  it("does not need customer_id and ignores extra columns", () => {
    expect(ok(parseCustomerCsv("annual_spend,purchases\n10,1")).validRows).toBe(1)
    expect(ok(parseCustomerCsv("region,annual_spend,purchases,notes\nN,10,1,x")).validRows).toBe(1)
  })

  it.each([
    ["annual_spnd,purchases", "'annual_spend'"],
    ["spend,purchases", "'annual_spend'"],
    ["Spend ($),purchases", "'annual_spend'"],
    ["annual spend,purchases", "'annual_spend'"],
    ["annual_spend,purchase", "'purchases'"],
    ["annual_spend,transactions", "'purchases'"],
    ["amount,count", "'annual_spend' or 'purchases'"],
  ])("rejects a mistyped or guessed header: %s", (header, named) => {
    const r = parseCustomerCsv(`${header}\n100,2\n`)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.kind).toBe("header")
    expect(r.message).toBe(`We couldn't find a column named ${named}. Please use the template.`)
  })

  it("never matches by position, even when the values look right", () => {
    const r = parseCustomerCsv("col1,col2\n100,2\n200,3\n")
    expect(r.ok).toBe(false)
  })

  it("rejects a file without a header row instead of reading the first row as data", () => {
    expect(parseCustomerCsv("100,2\n200,3\n").ok).toBe(false)
  })

  it("does not process anything when the header is wrong", () => {
    const r = parseCustomerCsv("annual_spend,purchase\n" + "100,2\n".repeat(500))
    expect(r).toEqual({ ok: false, kind: "header", message: "We couldn't find a column named 'purchases'. Please use the template." })
  })

  it("points to commas when the file uses another separator", () => {
    const r = parseCustomerCsv("annual_spend;purchases\n100;2\n")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain("Values must be separated by commas.")
  })

  it("rejects a required column that appears twice", () => {
    const r = parseCustomerCsv("annual_spend,purchases,Annual_Spend\n1,1,2\n")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain("'annual_spend' appears more than once")
  })
})

// ─────────────────────────────────────────────────────────────
// Row-by-row validation
// ─────────────────────────────────────────────────────────────
describe("row validation", () => {
  it("classifies each reason separately", () => {
    expect(checkCsvRow(100, 3)).toBe("valid")
    expect(checkCsvRow(0, 3)).toBe("invalidSpend")
    expect(checkCsvRow(-5, 3)).toBe("invalidSpend")
    expect(checkCsvRow(null, 3)).toBe("missingValues")
    expect(checkCsvRow(100, null)).toBe("missingValues")
    expect(checkCsvRow(100, 0)).toBe("zeroPurchases")
    expect(checkCsvRow(100, -1)).toBe("negativePurchases")
  })

  it("counts every skipped row under exactly one reason", () => {
    const text = [
      "annual_spend,purchases,customer_id",
      "100,2,C1",        // valid
      "250.5,3,C2",      // valid
      "0,2,C3",          // invalid spend
      "-40,1,C4",        // invalid spend
      "-1,0,C5",         // invalid spend (spend is checked before purchases)
      ",2,C6",           // missing
      "120,,C7",         // missing
      "abc,2,C8",        // missing
      "120,two,C9",      // missing
      "NaN,2,C10",       // missing
      "90",              // missing (short row)
      "80,0,C11",        // zero purchases with spend
      "70,0,C12",        // zero purchases with spend
      "",                // blank line: not a row
      "60,-2,C13",       // negative purchases
      "55,1,",           // valid, empty customer_id is fine
      "40,1,anything at all, even commas",  // valid, customer_id not validated
    ].join("\n")
    const r = ok(parseCustomerCsv(text))
    expect(r.validRows).toBe(4)
    expect(r.skipped).toEqual({ invalidSpend: 3, missingValues: 6, zeroPurchases: 2, negativePurchases: 1 })
    expect(r.skippedTotal).toBe(12)
    expect(r.dataRows).toBe(16)
    expect(r.sampled).toBe(false)
    expect(r.customers).toEqual([
      { spend: 100, purchases: 2 },
      { spend: 250.5, purchases: 3 },
      { spend: 55, purchases: 1 },
      { spend: 40, purchases: 1 },
    ])
  })

  it("summary sentence names each reason", () => {
    const r = ok(parseCustomerCsv("annual_spend,purchases\n100,2\n0,1\n,1\n5,0\n5,0\n"))
    expect(csvSummarySentence(r)).toBe("1 row loaded, 4 rows skipped (1: invalid spend, 1: missing values, 2: zero purchases with spend).")
    const neg = ok(parseCustomerCsv("annual_spend,purchases\n100,-2\n"))
    expect(csvSummarySentence(neg)).toContain("1: negative purchases")
  })
})

// ─────────────────────────────────────────────────────────────
// File-level errors
// ─────────────────────────────────────────────────────────────
describe("file errors", () => {
  it("rejects files that are not CSV, empty or too large before reading", () => {
    expect(checkCsvFile({ name: "customers.csv", size: 1000 })).toBeNull()
    expect(checkCsvFile({ name: "CUSTOMERS.CSV", size: 1000 })).toBeNull()
    expect(checkCsvFile({ name: "customers.xlsx", size: 1000 })?.kind).toBe("format")
    expect(checkCsvFile({ name: "customers.csv", size: 0 })?.message).toBe("The file is empty.")
    expect(checkCsvFile({ name: "customers.csv", size: 60 * 1024 * 1024 })?.kind).toBe("format")
  })

  it.each([
    ["empty", ""],
    ["whitespace only", " \n\n \r\n"],
    ["header only", "annual_spend,purchases,customer_id\n"],
    ["a spreadsheet saved with a .csv name", "PK\u0003\u0004\u0014\u0000\u0006\u0000binary"],
    ["binary noise", "��\u0000���������"],
  ])("gives a readable format error: %s", (_, text) => {
    const r = parseCustomerCsv(text)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.kind).toBe("format")
      expect(r.message.length).toBeGreaterThan(10)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Row limit and deterministic random sampling
// ─────────────────────────────────────────────────────────────

/** Log-normal customers, written to CSV sorted by spend so that cutting the file would bias the result. */
function bigFile(n: number, seed = 7): { text: string; spends: number[] } {
  const rand = mulberry32(seed)
  const spends: number[] = []
  for (let i = 0; i < n; i++) {
    const u = Math.max(rand(), 1e-12)
    const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
    spends.push(Math.round(300 * Math.exp(1.1 * g) * 100) / 100 + 0.01)
  }
  spends.sort((a, b) => a - b)
  const lines = ["annual_spend,purchases,customer_id"]
  spends.forEach((s, i) => lines.push(`${s},${Math.max(1, Math.round(s / 60))},C${i}`))
  return { text: lines.join("\n"), spends }
}

describe("row limit and sampling", () => {
  const N = 120_000
  const { text, spends } = bigFile(N)
  const r = ok(parseCustomerCsv(text))
  const sampleSpends = r.customers.map((c) => c.spend)

  it(`keeps exactly ${CSV_ROW_LIMIT.toLocaleString("en-GB")} rows and reports the full count`, () => {
    expect(r.sampled).toBe(true)
    expect(r.validRows).toBe(N)
    expect(r.customers).toHaveLength(CSV_ROW_LIMIT)
    expect(csvSampleSentence(r)).toBe("Showing results based on a random sample of 50,000 out of 120,000 rows. Extreme customers may be under- or over-represented.")
  })

  it("is deterministic: the same file gives the same sample", () => {
    const again = ok(parseCustomerCsv(text))
    expect(again.customers).toEqual(r.customers)
  })

  it("does not cut the top or bottom of the file", () => {
    // The file is sorted by spend: a cut would keep only the cheapest or dearest 50,000
    const max = Math.max(...sampleSpends)
    const min = Math.min(...sampleSpends)
    expect(max).toBeGreaterThan(spends[Math.floor(N * 0.99)])
    expect(min).toBeLessThan(spends[Math.floor(N * 0.01)])
  })

  it("keeps the distribution: median ±0.5%, top-20% share ±0.5 pp (same tolerance as the log-normal tests)", () => {
    const full = spends.map((spend) => ({ spend, purchases: 1 }))
    expect(Math.abs(median(sampleSpends) / median(spends) - 1)).toBeLessThanOrEqual(0.005)
    expect(Math.abs(topShare(r.customers) - topShare(full)) * 100).toBeLessThanOrEqual(0.5)
  })

  it("keeps the shape across the range: every decile within 1 pp of 10%", () => {
    const sorted = [...spends]
    const cuts = Array.from({ length: 9 }, (_, i) => sorted[Math.floor(((i + 1) / 10) * N)])
    const counts = new Array(10).fill(0)
    for (const s of sampleSpends) {
      let k = 0
      while (k < 9 && s >= cuts[k]) k++
      counts[k]++
    }
    for (const c of counts) expect(Math.abs(c / CSV_ROW_LIMIT - 0.1) * 100).toBeLessThanOrEqual(1)
  })

  it("does not sample at or below the limit", () => {
    const small = ok(parseCustomerCsv(bigFile(CSV_ROW_LIMIT).text))
    expect(small.sampled).toBe(false)
    expect(small.customers).toHaveLength(CSV_ROW_LIMIT)
  })

  it("the limit counts valid rows only", () => {
    const lines = ["annual_spend,purchases"]
    for (let i = 0; i < CSV_ROW_LIMIT; i++) lines.push(`${10 + (i % 500)},1`)
    for (let i = 0; i < 1_000; i++) lines.push("0,1")
    const res = ok(parseCustomerCsv(lines.join("\n")))
    expect(res.sampled).toBe(false)
    expect(res.skipped.invalidSpend).toBe(1_000)
  })
})

// ─────────────────────────────────────────────────────────────
// Same structure as paths A and B: the rest of the tool works unchanged
// ─────────────────────────────────────────────────────────────
describe("integration with tier calculations", () => {
  it("parsed customers feed planTiers directly; shares add up to 100%", () => {
    const r = ok(parseCustomerCsv(bigFile(5_000, 3).text))
    const thresholds = suggestThresholds(r.customers, 3)
    const result = planTiers(r.customers, params({ tierCount: 3, thresholds }))
    expect(result.population).toBe(5_000)
    expect(result.tiers.reduce((s, t) => s + t.customerShare, 0)).toBeCloseTo(1, 9)
    expect(result.tiers.reduce((s, t) => s + t.revenueShare, 0)).toBeCloseTo(1, 9)
  })

  it("with sampling, weight = valid rows ÷ sample size scales counts back to the whole file", () => {
    const r = ok(parseCustomerCsv(bigFile(120_000).text))
    const weight = r.validRows / r.customers.length
    const result = planTiers(r.customers, params(), weight)
    expect(result.population).toBeCloseTo(120_000, 6)
  })

  it.each([
    ["every row skipped", "annual_spend,purchases\n0,1\n,2\n5,0\n"],
    ["one valid row", "annual_spend,purchases\n0,1\n120,3\n"],
    ["two identical rows", "annual_spend,purchases\n50,1\n50,1\n"],
  ])("a file with %s does not crash the tool", (_, text) => {
    const r = ok(parseCustomerCsv(text))
    expect(() => {
      for (const k of [1, 2, 3, 4]) {
        const thresholds = suggestThresholds(r.customers, k)
        const result = planTiers(r.customers, params({ tierCount: k, thresholds, excludeExtremes: true }))
        expect(result.tiers).toHaveLength(k + 1)
      }
    }).not.toThrow()
  })
})
