// Generates the test files for the CSV path. Run: node generuj.mjs (deterministic output).
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const dir = dirname(fileURLToPath(import.meta.url))
const HEADER = "annual_spend,purchases,customer_id"

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Retail customers (log-normal spend, Poisson-ish purchases) plus a few business buyers. */
function customers(n, corporate, seed) {
  const rand = mulberry32(seed)
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand())
  const rows = []
  for (let i = 0; i < n - corporate; i++) {
    const purchases = Math.max(1, Math.round(4 * Math.exp(0.7 * gauss())))
    const basket = 48 * Math.exp(0.4 * gauss())
    rows.push([(purchases * basket).toFixed(2), purchases])
  }
  for (let i = 0; i < corporate; i++) {
    const purchases = 80 + Math.floor(rand() * 60)
    rows.push([(purchases * (300 + rand() * 100)).toFixed(2), purchases])
  }
  return rows.map(([s, p], i) => `${s},${p},C${String(i + 1).padStart(6, "0")}`)
}

const write = (name, lines) => writeFileSync(join(dir, name), lines.join("\n") + "\n")

// 1. Valid file built on the template: 2,000 customers, 12 business buyers
write("1-poprawny.csv", [HEADER, ...customers(2_000, 12, 101)])

// 2. Wrong header: a typo in annual_spend, otherwise valid
write("2-zly-naglowek.csv", ["annual_spnd,purchases,customer_id", ...customers(200, 0, 102)])

// 3. Mix of valid and invalid rows: 400 valid + 11 invalid spend, 9 missing values, 6 zero purchases
const mixed = customers(400, 3, 103)
const bad = [
  ...Array.from({ length: 7 }, (_, i) => `0,${i + 1},BAD-SPEND-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `-${(i + 1) * 25},2,NEG-SPEND-${i}`),
  ",3,EMPTY-SPEND", "120.00,,EMPTY-PURCHASES", "n/a,2,TEXT-SPEND", "85.50,three,TEXT-PURCHASES",
  "€90,2,CURRENCY", "\"1,200.00\",5,THOUSANDS", "NaN,1,NAN", "310", "  ,  ,BLANKS",
  ...Array.from({ length: 6 }, (_, i) => `${(i + 1) * 40}.00,0,ZERO-PURCHASES-${i}`),
]
bad.forEach((row, i) => mixed.splice(20 + i * 15, 0, row))
write("3-mieszany.csv", [HEADER, ...mixed])

// 4. Above the limit: 80,000 valid customers, sorted by spend so a cut would be visible
const big = customers(80_000, 40, 104).sort((a, b) => parseFloat(a) - parseFloat(b))
write("4-ponad-50000.csv", [HEADER, ...big])
