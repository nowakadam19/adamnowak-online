import { describe, it, expect } from "vitest"
import { clientKey, createDailyLimiter, limitMessage, DAILY_MESSAGE_LIMIT, UNKNOWN_CLIENT } from "./chat-rate-limit"

const day = (iso: string) => new Date(iso)

describe("createDailyLimiter", () => {
  it("allows DAILY_MESSAGE_LIMIT messages per key and refuses the next one", () => {
    const limiter = createDailyLimiter()
    const now = day("2026-09-25T10:00:00Z")
    for (let i = 0; i < DAILY_MESSAGE_LIMIT; i++) expect(limiter.take("1.1.1.1", now)).toBe(true)
    expect(limiter.take("1.1.1.1", now)).toBe(false)
    expect(limiter.take("1.1.1.1", now)).toBe(false)
  })

  it("keeps a separate budget for each key", () => {
    const limiter = createDailyLimiter(2)
    const now = day("2026-09-25T10:00:00Z")
    expect(limiter.take("a", now)).toBe(true)
    expect(limiter.take("a", now)).toBe(true)
    expect(limiter.take("a", now)).toBe(false)
    expect(limiter.take("b", now)).toBe(true)
  })

  it("resets at the start of the next UTC day", () => {
    const limiter = createDailyLimiter(1)
    expect(limiter.take("a", day("2026-09-25T23:59:59Z"))).toBe(true)
    expect(limiter.take("a", day("2026-09-25T23:59:59Z"))).toBe(false)
    expect(limiter.take("a", day("2026-09-26T00:00:00Z"))).toBe(true)
    expect(limiter.take("a", day("2026-09-26T12:00:00Z"))).toBe(false)
  })

  it("the limit is 15", () => {
    expect(DAILY_MESSAGE_LIMIT).toBe(15)
  })
})

describe("clientKey", () => {
  it("uses the first address in x-forwarded-for", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1", "x-real-ip": "10.0.0.9" }))).toBe("203.0.113.7")
  })

  it("falls back to x-real-ip", () => {
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4")
  })

  it("puts requests without an IP header in one shared bucket", () => {
    expect(clientKey(new Headers())).toBe(UNKNOWN_CLIENT)
    expect(clientKey(new Headers({ "x-forwarded-for": " " }))).toBe(UNKNOWN_CLIENT)
  })
})

describe("limitMessage", () => {
  it("is English by default and Polish for a Polish browser", () => {
    expect(limitMessage(null)).toBe("You've reached today's limit for this assistant. Try again tomorrow.")
    expect(limitMessage("de-DE,de;q=0.9")).toBe(limitMessage(null))
    expect(limitMessage("pl-PL,pl;q=0.9,en;q=0.8")).toMatch(/^Na dziś/)
  })
})
