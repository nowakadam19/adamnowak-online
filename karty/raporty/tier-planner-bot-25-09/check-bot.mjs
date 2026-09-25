// Playwright check for the Tier Planner bot panel: screenshots at 360 and 1280 px, no API call
// before Start, fresh tool state after a slider move, limit message, touch targets, no customer data
// in the payload. /api/chat is intercepted with canned replies (layout test, not a model test);
// BOT=live sends requests to the real endpoint instead.
// Usage: BASE=http://localhost:3000 node check-bot.mjs   (PW=path to playwright(-core) if not installed locally)
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { writeFileSync } from "node:fs"

const { chromium } = await import(process.env.PW ?? "playwright-core")
const dir = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? "http://localhost:3000"
const LIVE = process.env.BOT === "live"
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium" })
const report = []
const log = (...a) => { const line = a.join(" "); report.push(line); console.log(line) }
let failed = false
const check = (ok, what) => { log(ok ? "✅" : "❌", what); if (!ok) failed = true }

const CANNED = [
  "Your top tier holds 5.1% of customers and 31% of revenue, and its benefit costs 1.4% of that tier's margin, so it stays small, as it should. From Base, a typical member needs 3 more purchases a year and makes 3 today; that is a real stretch. After the first qualification period, check who actually reached Tier 1 and how close the rest came. Prestige or discount: which would your best customers notice more?",
  "I can't tell you which benefit works better; the data can't settle that. What the tool shows: the 2% discount on Tier 1 gives away €13,000 a year on purchases that tier already makes. Would those customers buy anyway without it?",
  "Tier 2 now starts at €2,000, and only 1.2% of customers are in it. Almost nobody in Tier 1 is within one purchase of it, which suggests the threshold is set for extreme customers.",
]
const LIMIT = "You've reached today's limit for this assistant. Try again tomorrow."

for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: width < 1024 ? 780 : 900 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  const bodies = []
  let limitOn = false
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON()
    bodies.push(body)
    if (LIVE) return route.continue()
    await new Promise((r) => setTimeout(r, 400))
    if (limitOn) return route.fulfill({ status: 429, json: { error: "rate_limited", message: LIMIT } })
    route.fulfill({ json: { text: CANNED[Math.min(bodies.length - 1, CANNED.length - 1)] } })
  })

  await page.goto(`${BASE}/tools/loyalty-tier-planner?d=s`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /reject all/i }).click({ timeout: 5_000 }).catch(() => {})
  const panel = page.locator("section", { has: page.getByRole("heading", { name: "Ask about your tiers" }) })
  await panel.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  check(bodies.length === 0, `${width}px: no /api/chat request before Start`)

  // The site header and the planner's sticky bar are fixed; hidden only while the panel itself is captured
  await page.addStyleTag({ content: "html.shot header, html.shot .tp-sticky { visibility: hidden !important }" })
  const shot = async (name) => {
    await page.evaluate(() => document.documentElement.classList.add("shot"))
    await panel.scrollIntoViewIfNeeded()
    await panel.screenshot({ path: join(dir, `${width}-${name}.png`) })
    await page.evaluate(() => document.documentElement.classList.remove("shot"))
  }
  const noHScroll = async (what) => {
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
    check(sw <= iw, `${width}px ${what}: no horizontal scroll (${sw} ≤ ${iw})`)
  }
  const size = async (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })

  await shot("1-before-start")
  await noHScroll("before Start")
  const startBtn = panel.getByRole("button", { name: "Start" })
  const [sw, sh] = await size(startBtn)
  check(sh >= 44, `${width}px: Start button ${sw}×${sh}, height ≥ 44`)

  await startBtn.click()
  const bubbles = panel.locator("[role=log] > div")
  await bubbles.first().waitFor()
  await page.waitForFunction(() => !document.querySelector('[aria-label="Assistant is typing"]'))
  check(bodies.length === 1 && bodies[0].mode === "tier-planner" && bodies[0].messages.length === 0, `${width}px: Start sends one opening request with no visitor message`)
  await shot("2-first-comment")

  const textarea = panel.getByRole("textbox", { name: "Your question about the tiers" })
  // What the visitor sees when they tap the field: header and sticky bar visible, field clear of both
  await textarea.focus()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: join(dir, `${width}-2b-viewport-field-focused.png`) })
  const clear = await textarea.evaluate((el) => {
    const f = el.getBoundingClientRect()
    const bar = document.querySelector(".tp-sticky")
    const b = bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect() : null
    return { ok: f.top >= 60 && (!b || f.bottom <= b.top), top: Math.round(f.top), bottom: Math.round(f.bottom), bar: b ? Math.round(b.top) : null }
  })
  check(clear.ok, `${width}px: focused text field clear of the header and the sticky bar (field ${clear.top}–${clear.bottom} px, bar from ${clear.bar ?? "—"} px)`)
  const fontSize = await textarea.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  check(fontSize >= 16, `${width}px: text field font-size ${fontSize}px ≥ 16`)
  const send = panel.getByRole("button", { name: "Send" })
  const [bw, bh] = await size(send)
  check(bw >= 44 && bh >= 44, `${width}px: Send button ${bw}×${bh} ≥ 44`)
  const [tw, th] = await size(textarea)
  check(th >= 44, `${width}px: text field ${tw}×${th}, height ≥ 44`)

  const ask = async (text) => {
    const n = bodies.length
    await textarea.fill(text)
    await send.click()
    await page.waitForFunction((k) => document.querySelectorAll("[role=log] > div").length >= k, n * 2 + 1)
    await page.waitForFunction(() => !document.querySelector('[aria-label="Assistant is typing"]'))
    return bodies[n]
  }
  const q1 = await ask("Should Tier 1 get a discount or a prestige benefit?")
  check(q1.messages.length === 2 && q1.messages[1].content.startsWith("Should Tier 1"), `${width}px: history carries the opening comment and the question`)

  // Move the Tier 2 threshold during the conversation; the next request must carry the new state
  const before = q1.context.tiers[2].fromEur
  const field = page.getByRole("textbox", { name: "Spend to reach Tier 2" })
  await field.click()
  await field.fill("2000")
  await field.press("Enter")
  await page.waitForTimeout(400)
  const q2 = await ask("What changed after I moved the Tier 2 threshold?")
  check(before !== 2000 && q2.context.tiers[2].fromEur === 2000, `${width}px: after the slider move the next message carries Tier 2 from €2,000 (was €${before})`)
  await shot("3-conversation")
  await noHScroll("conversation")

  limitOn = true
  await textarea.fill("One more question")
  await send.click()
  await panel.getByRole("status").filter({ hasText: /limit/i }).waitFor()
  check(await textarea.isDisabled(), `${width}px: limit message in the panel, text field disabled`)
  await shot("4-limit")
  await noHScroll("limit")

  const json = JSON.stringify(bodies)
  check(Math.max(...bodies.map((b) => JSON.stringify(b.context).length)) < 5_000, `${width}px: every context under 5 kB`)
  check(errors.length === 0, `${width}px: no page errors ${errors.join("; ")}`)
  if (width === 360) writeFileSync(join(dir, "payload-sample.json"), JSON.stringify(bodies[0], null, 2))
  await page.close()

  // Path C: an uploaded file — the payload carries no file name and no rows
  const csvPage = await browser.newPage({ viewport: { width, height: 900 } })
  const csvBodies = []
  await csvPage.route("**/api/chat", (route) => { csvBodies.push(route.request().postData() ?? ""); route.fulfill({ json: { text: CANNED[0] } }) })
  await csvPage.goto(`${BASE}/tools/loyalty-tier-planner`, { waitUntil: "networkidle" })
  await csvPage.getByRole("button", { name: /reject all/i }).click({ timeout: 5_000 }).catch(() => {})
  await csvPage.getByRole("radio", { name: /upload your own data/i }).click()
  await csvPage.locator("input[type=file]").setInputFiles(join(dir, "../tier-planner-csv-25-09/pliki-testowe/1-poprawny.csv"))
  await csvPage.getByRole("heading", { name: "Ask about your tiers" }).waitFor()
  await csvPage.getByRole("button", { name: "Start" }).click()
  await csvPage.locator("[role=log] > div").first().waitFor()
  const body = csvBodies[0] ?? ""
  check(csvBodies.length === 1 && body.includes('"source":"csv"') && !/1-poprawny|\.csv/i.test(body), `${width}px CSV: payload has source csv, no file name (${body.length} chars)`)
  await csvPage.close()
}

await browser.close()
writeFileSync(join(dir, "wynik-check-bot.txt"), report.join("\n") + "\n")
process.exit(failed ? 1 : 0)
