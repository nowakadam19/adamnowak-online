// Loyalty Tier Planner — CSV input (path C). Pure functions, no DOM, no React.
// The file is read and parsed in the browser only; nothing here sends data anywhere.

import { mulberry32, type Customer } from "./tier-calculations"

export const CSV_TEMPLATE_URL = "/loyalty-tier-planner-template.csv"
export const CSV_REQUIRED_COLUMNS = ["annual_spend", "purchases"] as const

/** Valid rows analysed at most. Above this, a random sample of this size is used. */
export const CSV_ROW_LIMIT = 50_000
/** Below this many valid rows the UI warns that results will be unstable. */
export const CSV_FEW_ROWS = 20
/** Larger files are refused before reading, to keep phones responsive. */
export const CSV_MAX_BYTES = 50 * 1024 * 1024
/** Fixed seed: the same file always gives the same sample. */
export const CSV_SAMPLE_SEED = 20260925

export interface CsvSkipped {
  /** annual_spend ≤ 0 */
  invalidSpend: number
  /** annual_spend or purchases empty, text or missing from the row */
  missingValues: number
  /** purchases = 0 while annual_spend > 0 */
  zeroPurchases: number
  /** purchases below zero */
  negativePurchases: number
}

export interface CsvSuccess {
  ok: true
  /** Customers analysed: every valid row, or a random sample of CSV_ROW_LIMIT of them */
  customers: Customer[]
  /** Valid rows in the file, before sampling */
  validRows: number
  /** Non-empty data rows in the file (valid + skipped) */
  dataRows: number
  skipped: CsvSkipped
  skippedTotal: number
  sampled: boolean
}

export interface CsvFailure {
  ok: false
  kind: "header" | "format"
  message: string
}

export type CsvResult = CsvSuccess | CsvFailure

const formatError = (message: string): CsvFailure => ({ ok: false, kind: "format", message })

// ─────────────────────────────────────────────────────────────
// File checks (before reading)
// ─────────────────────────────────────────────────────────────

const NOT_CSV = "This file doesn't look like a CSV. If it's a spreadsheet, save it as CSV (comma-separated) first, or start from the template."

/** Refuses files that are clearly not CSV, empty or too large. Returns null when the file can be read. */
export function checkCsvFile(file: { name: string; size: number }): CsvFailure | null {
  if (!/\.(csv|txt)$/i.test(file.name)) return formatError(NOT_CSV)
  if (file.size === 0) return formatError("The file is empty.")
  if (file.size > CSV_MAX_BYTES) return formatError(`The file is larger than ${CSV_MAX_BYTES / 1024 / 1024} MB. Remove columns other than annual_spend and purchases, or split the file.`)
  return null
}

// ─────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────

/**
 * Calls `onRow` for every row of comma-separated text. Handles quoted fields
 * ("a, b" and "say ""hi"""), CRLF and LF line endings. Returning false stops.
 */
export function forEachCsvRow(text: string, onRow: (fields: string[]) => boolean | void): void {
  let fields: string[] = []
  let field = ""
  let quoted = false
  let i = 0
  const n = text.length
  const endRow = () => {
    fields.push(field)
    const keepGoing = onRow(fields)
    fields = []
    field = ""
    return keepGoing !== false
  }
  while (i < n) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        quoted = false
      } else {
        field += ch
      }
      i++
      continue
    }
    if (ch === '"' && field.trim() === "") { quoted = true; field = ""; i++; continue }
    if (ch === ",") { fields.push(field); field = ""; i++; continue }
    if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      i++
      if (!endRow()) return
      continue
    }
    field += ch
    i++
  }
  if (field !== "" || fields.length > 0) endRow()
}

const PLAIN_NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

/** Plain decimal number (dot as decimal separator, no thousands separators), or null. */
export function parseCsvNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const s = raw.trim()
  if (!PLAIN_NUMBER.test(s)) return null
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}

const normaliseHeader = (h: string) => h.replace(/^﻿/, "").trim().toLowerCase()

/** Column positions of annual_spend and purchases, matched by exact name (case and surrounding spaces ignored). */
export function matchCsvHeader(header: string[]): { spend: number; purchases: number } | CsvFailure {
  const names = header.map(normaliseHeader)
  const missing = CSV_REQUIRED_COLUMNS.filter((c) => !names.includes(c))
  if (missing.length) {
    const quoted = missing.map((c) => `'${c}'`).join(" or ")
    const separator = header.length === 1 && /[;\t]/.test(header[0])
      ? " Values must be separated by commas."
      : ""
    return { ok: false, kind: "header", message: `We couldn't find a column named ${quoted}.${separator} Please use the template.` }
  }
  const twice = CSV_REQUIRED_COLUMNS.find((c) => names.indexOf(c) !== names.lastIndexOf(c))
  if (twice) return { ok: false, kind: "header", message: `The column '${twice}' appears more than once. Please use the template.` }
  return { spend: names.indexOf("annual_spend"), purchases: names.indexOf("purchases") }
}

export type RowCheck = keyof CsvSkipped | "valid"

/** Why a row is skipped, checked in this order: missing values, invalid spend, zero purchases, negative purchases. */
export function checkCsvRow(spend: number | null, purchases: number | null): RowCheck {
  if (spend === null || purchases === null) return "missingValues"
  if (spend <= 0) return "invalidSpend"
  if (purchases === 0) return "zeroPurchases"
  if (purchases < 0) return "negativePurchases"
  return "valid"
}

function looksBinary(text: string): boolean {
  const head = text.slice(0, 2048)
  if (head.startsWith("PK") || head.startsWith("%PDF") || head.includes("\u0000")) return true
  const replacement = head.split("�").length - 1
  return replacement > 8 && replacement > head.length / 50
}

/**
 * Parses the text of a CSV file into customers. Rows are validated one by one;
 * above `limit` valid rows a seeded random sample (reservoir sampling) of `limit`
 * rows is kept, so every part of the file has the same chance of being used.
 */
export function parseCustomerCsv(text: string, limit = CSV_ROW_LIMIT, seed = CSV_SAMPLE_SEED): CsvResult {
  if (text.replace(/^﻿/, "").trim() === "") return formatError("The file is empty.")
  if (looksBinary(text)) return formatError(NOT_CSV)

  const skipped: CsvSkipped = { invalidSpend: 0, missingValues: 0, zeroPurchases: 0, negativePurchases: 0 }
  const reservoir: Customer[] = []
  const rand = mulberry32(seed)
  let columns = null as { spend: number; purchases: number } | null
  let headerError = null as CsvFailure | null
  let dataRows = 0
  let validRows = 0

  forEachCsvRow(text, (fields) => {
    // Blank lines (including a trailing newline) are not rows
    if (fields.length === 1 && fields[0].trim() === "") return
    if (!columns) {
      const matched = matchCsvHeader(fields)
      if ("ok" in matched) { headerError = matched; return false }
      columns = matched
      return
    }
    dataRows++
    const spend = parseCsvNumber(fields[columns.spend])
    const purchases = parseCsvNumber(fields[columns.purchases])
    const check = checkCsvRow(spend, purchases)
    if (check !== "valid") { skipped[check]++; return }
    const customer = { spend: spend as number, purchases: purchases as number }
    if (validRows < limit) {
      reservoir.push(customer)
    } else {
      const j = Math.floor(rand() * (validRows + 1))
      if (j < limit) reservoir[j] = customer
    }
    validRows++
  })

  if (headerError) return headerError
  if (dataRows === 0) return formatError("The file has column names but no rows of data.")

  const skippedTotal = skipped.invalidSpend + skipped.missingValues + skipped.zeroPurchases + skipped.negativePurchases
  return { ok: true, customers: reservoir, validRows, dataRows, skipped, skippedTotal, sampled: validRows > limit }
}

// ─────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────

const count = (n: number) => n.toLocaleString("en-GB")
const rows = (n: number) => `${count(n)} row${n === 1 ? "" : "s"}`

/** "X rows loaded, Y rows skipped (Z: invalid spend, Z: missing values, Z: zero purchases with spend)." */
export function csvSummarySentence(r: CsvSuccess): string {
  const reasons = [
    `${count(r.skipped.invalidSpend)}: invalid spend`,
    `${count(r.skipped.missingValues)}: missing values`,
    `${count(r.skipped.zeroPurchases)}: zero purchases with spend`,
  ]
  if (r.skipped.negativePurchases > 0) reasons.push(`${count(r.skipped.negativePurchases)}: negative purchases`)
  return `${rows(r.validRows)} loaded, ${rows(r.skippedTotal)} skipped (${reasons.join(", ")}).`
}

export function csvSampleSentence(r: CsvSuccess, limit = CSV_ROW_LIMIT): string {
  return `Showing results based on a random sample of ${count(Math.min(limit, r.customers.length))} out of ${count(r.validRows)} rows. Extreme customers may be under- or over-represented.`
}
