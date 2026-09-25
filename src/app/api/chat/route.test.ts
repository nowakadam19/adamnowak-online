import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { buildTierBotContext, distributionSummary } from "@/lib/tier-bot-context"
import { planTiers, sampleCustomers, DEFAULT_BENEFITS, DEFAULT_NAMES, type ProgrammeParams } from "@/lib/tier-calculations"
import { TIER_PLANNER_OPENER } from "@/lib/bot-prompts/tier-planner"

const create = vi.hoisted(() => vi.fn())
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create } },
}))

// Eva's prompt as it was in route.ts before modes existed (main @ 375feea). Must not change.
const ORIGINAL_EVA_PROMPT = `You are Eva, a warm and concise assistant on Adam Nowak's personal website.
Your name is Eva. If someone asks who you are, say you're Adam's assistant.
Adam is a senior customer loyalty strategist with 20+ years of EMEA experience.

Your only job: collect the visitor's first name, reason for reaching out, and email address.

Rules:
- Maximum 2 short sentences per response. No exceptions.
- Ask one thing at a time. Never list what you need.
- No "Great!", "Perfect!", "Absolutely!" or any affirmation filler.
- Do not volunteer information about Adam's services, rates, or availability.
- If someone asks a question about Adam, say you'll make sure he gets back to them.
- Be warm, human, and direct.
- Detect the language the visitor writes in and respond in that same language. Always.
- Never share Adam's email address, phone number, or any personal contact details.
- If someone asks for Adam's email or direct contact, explain that Adam will reach out to them personally after you pass along their message.
- Your job is to collect their contact info — not to share Adam's.
- Do not engage in small talk about yourself. If someone asks how you are, briefly redirect to how you can help them.

When you have name + reason + email, write one natural closing sentence. Then on a NEW LINE write exactly:
CONTACT_COLLECTED:{"name":"...","email":"...","message":"..."}

Start: brief greeting, ask how you can help.`

const params: ProgrammeParams = {
  marginPct: 40, tierCount: 2, thresholds: [300, 800], windowMonths: 12, validityYears: 1,
  benefits: DEFAULT_BENEFITS, softLanding: true, activityKeep: false, excludeExtremes: false, names: DEFAULT_NAMES,
}
const context = buildTierBotContext({
  source: "sample", params, result: planTiers(sampleCustomers(), params),
  distribution: distributionSummary(sampleCustomers()), change: null, currentThresholds: null,
})

const reply = (text: string) => ({ content: [{ type: "text", text }] })

function request(body: unknown, headers: Record<string, string> = { "x-forwarded-for": "203.0.113.1" }) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

// A fresh module per test = a fresh in-memory limiter
async function loadPost() {
  vi.resetModules()
  return (await import("./route")).POST
}

const hi = [{ role: "user", content: "Hi" }]

beforeEach(() => {
  create.mockReset()
  create.mockResolvedValue(reply("ok"))
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe("mode: eva (default) — unchanged behaviour", () => {
  it("without mode: Eva's original prompt, model, max_tokens and messages as sent", async () => {
    const POST = await loadPost()
    const messages = [...hi, { role: "assistant", content: "Hello — how can I help?" }, { role: "user", content: "Cześć, jestem Ola" }]
    const res = await POST(request({ messages }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ text: "ok" })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0]).toEqual({ model: "claude-sonnet-4-6", max_tokens: 300, system: ORIGINAL_EVA_PROMPT, messages })
  })

  it('mode "eva" is the same request', async () => {
    const POST = await loadPost()
    await POST(request({ messages: hi }))
    await POST(request({ mode: "eva", messages: hi }))
    expect(create.mock.calls[1][0]).toEqual(create.mock.calls[0][0])
  })

  it("passes CONTACT_COLLECTED through untouched (the /contact page parses it)", async () => {
    const POST = await loadPost()
    const text = 'Thanks, Ola — Adam will be in touch.\nCONTACT_COLLECTED:{"name":"Ola","email":"ola@example.com","message":"Loyalty audit"}'
    create.mockResolvedValue(reply(text))
    expect(await (await POST(request({ messages: hi }))).json()).toEqual({ text })
  })

  it("same errors as before: 400 on empty messages, 500 on a model error or bad JSON", async () => {
    const POST = await loadPost()
    expect((await POST(request({ messages: [] }))).status).toBe(400)
    expect(await (await POST(request({}))).json()).toEqual({ error: "Invalid messages" })
    expect((await POST(request("not json"))).status).toBe(500)
    create.mockRejectedValue(Object.assign(new Error("boom"), { status: 500 }))
    const res = await POST(request({ messages: hi }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "Internal error" })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it("retries on 529 (1 s, 2 s, 4 s) and then answers", async () => {
    vi.useFakeTimers()
    const POST = await loadPost()
    const overloaded = Object.assign(new Error("overloaded"), { status: 529 })
    create.mockRejectedValueOnce(overloaded).mockRejectedValueOnce(overloaded).mockRejectedValueOnce(overloaded).mockResolvedValueOnce(reply("back"))
    const pending = POST(request({ messages: hi }))
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000)
    const res = await pending
    expect(await res.json()).toEqual({ text: "back" })
    expect(create).toHaveBeenCalledTimes(4)
  })

  it("gives up after three 529 retries with a 500", async () => {
    vi.useFakeTimers()
    const POST = await loadPost()
    create.mockRejectedValue(Object.assign(new Error("overloaded"), { status: 529 }))
    const pending = POST(request({ messages: hi }))
    await vi.advanceTimersByTimeAsync(7000)
    expect((await pending).status).toBe(500)
    expect(create).toHaveBeenCalledTimes(4)
  })
})

describe("mode: tier-planner", () => {
  it("uses its own prompt with the current tool state, a hidden opener and a higher max_tokens", async () => {
    const POST = await loadPost()
    const res = await POST(request({ mode: "tier-planner", messages: [], context }))
    expect(res.status).toBe(200)
    const call = create.mock.calls[0][0]
    expect(call.model).toBe("claude-sonnet-4-6")
    expect(call.max_tokens).toBe(700)
    expect(call.system).not.toContain("Eva")
    expect(call.system).not.toBe(ORIGINAL_EVA_PROMPT)
    expect(call.system).toContain("TOOL STATE")
    expect(call.system).toContain(JSON.stringify(context))
    expect(call.messages).toEqual([{ role: "user", content: TIER_PLANNER_OPENER }])
  })

  it("sends the latest context with every turn", async () => {
    const POST = await loadPost()
    const history = [{ role: "assistant", content: "Opening comment" }, { role: "user", content: "And now?" }]
    const moved = { ...context, tiers: context.tiers.map((t, i) => (i === 2 ? { ...t, fromEur: 2000 } : t)) }
    await POST(request({ mode: "tier-planner", messages: history, context: moved }))
    const call = create.mock.calls[0][0]
    expect(call.system).toContain('"fromEur":2000')
    expect(call.messages).toEqual([{ role: "user", content: TIER_PLANNER_OPENER }, ...history])
  })

  it("rejects a missing context, customer rows, a broken history and an unknown mode", async () => {
    const POST = await loadPost()
    const rows = Array.from({ length: 100 }, (_, i) => ({ spend: i, purchases: 1 }))
    const bad = [
      { mode: "tier-planner", messages: [] },
      { mode: "tier-planner", messages: [], context: { ...context, rows } },
      { mode: "tier-planner", messages: [{ role: "user", content: "hi" }], context },
      { mode: "tier-planner", messages: [{ role: "assistant", content: "a" }], context },
      { mode: "tier-planner", messages: [{ role: "assistant", content: "a" }, { role: "user", content: "x".repeat(1_501) }], context },
      { mode: "roi", messages: hi },
    ]
    for (const body of bad) expect((await POST(request(body))).status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it("never writes the Eva contract into its prompt", async () => {
    const POST = await loadPost()
    await POST(request({ mode: "tier-planner", messages: [], context }))
    expect(create.mock.calls[0][0].system).toContain("never write CONTACT_COLLECTED")
    expect(create.mock.calls[0][0].system).not.toContain('CONTACT_COLLECTED:{')
  })
})

describe("daily limit — one budget per IP for both modes", () => {
  const eva = { messages: hi }
  const tier = { mode: "tier-planner", messages: [], context }

  it("15 mixed messages pass, the 16th gets 429 in both modes", async () => {
    const POST = await loadPost()
    for (let i = 0; i < 15; i++) expect((await POST(request(i % 2 ? tier : eva))).status).toBe(200)
    for (const body of [eva, tier]) {
      const res = await POST(request(body))
      expect(res.status).toBe(429)
      expect(await res.json()).toEqual({ error: "rate_limited", message: "You've reached today's limit for this assistant. Try again tomorrow." })
    }
    expect(create).toHaveBeenCalledTimes(15)
  })

  it("another IP still has its own budget", async () => {
    const POST = await loadPost()
    for (let i = 0; i < 16; i++) await POST(request(eva))
    expect((await POST(request(tier, { "x-forwarded-for": "198.51.100.2" }))).status).toBe(200)
  })

  it("requests without an IP header share one counter", async () => {
    const POST = await loadPost()
    for (let i = 0; i < 15; i++) expect((await POST(request(i % 2 ? tier : eva, {}))).status).toBe(200)
    expect((await POST(request(eva, { "x-real-ip": "" }))).status).toBe(429)
  })

  it("invalid requests do not use the budget", async () => {
    const POST = await loadPost()
    for (let i = 0; i < 20; i++) expect((await POST(request({ messages: [] }))).status).toBe(400)
    expect((await POST(request(eva))).status).toBe(200)
  })

  it("answers in Polish for a Polish browser", async () => {
    const POST = await loadPost()
    for (let i = 0; i < 15; i++) await POST(request(eva))
    const res = await POST(request(tier, { "x-forwarded-for": "203.0.113.1", "accept-language": "pl-PL,pl;q=0.9" }))
    expect((await res.json()).message).toMatch(/^Na dziś/)
  })
})
