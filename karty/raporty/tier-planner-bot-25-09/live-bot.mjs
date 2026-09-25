// Live run against a deployed preview (real model): Eva regression over the API, the Tier Planner bot
// in the UI (sample data at 360 px, a 60-row CSV at 1280 px, a slider move mid-conversation), then the
// shared daily limit. Writes transcripts to transkrypty.md and screenshots live-*.png.
// Usage: BASE=<preview URL with _vercel_share if protected> node live-bot.mjs  (PW=path to playwright(-core))
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { writeFileSync } from "node:fs"

const { chromium } = await import(process.env.PW ?? "playwright-core")
const dir = dirname(fileURLToPath(import.meta.url))
const BASE = new URL(process.env.BASE)
const origin = BASE.origin
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium" })
const ctx = await browser.newContext()
// Opening the share link once sets the bypass cookie for the protected preview
await (await ctx.newPage()).goto(BASE.href, { waitUntil: "domcontentloaded" })
const md = [`# Transkrypty — Tier Planner bot, podgląd ${origin}`, "", `Data: ${new Date().toISOString()}`, ""]
let sent = 0

// ── 1. Eva: full conversation to CONTACT_COLLECTED, same calls as /contact (seed "Hi", no mode) ──
md.push("## 1. Eva (/api/chat bez `mode`) — pełna rozmowa do CONTACT_COLLECTED", "")
const MARK = "CONTACT_COLLECTED:"
const clean = (t) => (t.includes(MARK) ? t.slice(0, t.indexOf(MARK)).trim() : t)
const history = [{ role: "user", content: "Hi" }]
const visitor = [
  "Dzień dobry, chciałabym porozmawiać o audycie programu lojalnościowego w naszej sieci sklepów.",
  "Mam na imię Ola.",
  "ola.test@example.com",
  "To wszystko, dziękuję.",
]
let collected = null
for (let turn = 0; turn <= visitor.length && !collected; turn++) {
  if (turn > 0) { history.push({ role: "user", content: visitor[turn - 1] }); md.push(`**Odwiedzająca:** ${visitor[turn - 1]}`, "") }
  const res = await ctx.request.post(`${origin}/api/chat`, { data: { messages: history } })
  sent++
  const body = await res.json()
  if (!res.ok()) { md.push(`**Błąd ${res.status()}:** ${JSON.stringify(body)}`, ""); break }
  md.push(`**Eva:** ${body.text.replace(/\n/g, "  \n")}`, "")
  history.push({ role: "assistant", content: clean(body.text) })
  if (body.text.includes(MARK)) collected = JSON.parse(body.text.slice(body.text.indexOf(MARK) + MARK.length).trim())
}
md.push(collected ? `➡️ Kontrakt odczytany tak jak na /contact: \`${JSON.stringify(collected)}\`` : "❌ Brak CONTACT_COLLECTED", "")

// ── 2. Tier Planner bot in the UI ──
async function botSession({ width, url, csv, questions, moveTier2, name }) {
  const page = await ctx.newPage()
  await page.setViewportSize({ width, height: width < 1024 ? 780 : 900 })
  const bodies = []
  page.on("request", (r) => { if (r.url().endsWith("/api/chat")) bodies.push(r.postDataJSON()) })
  await page.goto(`${origin}${url}`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /reject all/i }).click({ timeout: 5_000 }).catch(() => {})
  if (csv) {
    await page.getByRole("radio", { name: /upload your own data/i }).click()
    await page.locator("input[type=file]").setInputFiles(join(dir, csv))
  }
  await page.addStyleTag({ content: "html.shot header, html.shot .tp-sticky { visibility: hidden !important }" })
  const panel = page.locator("section", { has: page.getByRole("heading", { name: "Ask about your tiers" }) })
  const shot = async (n) => {
    await page.evaluate(() => document.documentElement.classList.add("shot"))
    await panel.scrollIntoViewIfNeeded()
    await panel.screenshot({ path: join(dir, `live-${width}-${n}.png`) })
    await page.evaluate(() => document.documentElement.classList.remove("shot"))
  }
  const idle = () => page.waitForFunction(() => !document.querySelector('[aria-label="Assistant is typing"]'), null, { timeout: 60_000 })
  const lastBot = () => panel.locator("[role=log] > div").last().innerText()
  md.push(`## ${name}`, "")
  await panel.getByRole("button", { name: "Start" }).click()
  await panel.locator("[role=log] > div").first().waitFor({ timeout: 60_000 })
  await idle(); sent++
  const t = bodies[0].context.tiers
  md.push(`Kontekst przy starcie: ${t.map((x) => `${x.name} od €${x.fromEur}: ${x.customersPct}% klientów, ${x.revenuePct}% przychodu`).join("; ")}.`, "")
  md.push(`**Bot (komentarz otwierający):** ${await lastBot()}`, "")
  await shot("1-first-comment")
  const box = panel.getByRole("textbox", { name: "Your question about the tiers" })
  for (const [i, q] of questions.entries()) {
    if (moveTier2 && i === questions.length - 1) {
      const field = page.getByRole("textbox", { name: "Spend to reach Tier 2" })
      await field.click(); await field.fill(String(moveTier2)); await field.press("Enter")
      await page.waitForTimeout(500)
      md.push(`*(Suwak: próg Tier 2 przesunięty na €${moveTier2} w trakcie rozmowy.)*`, "")
    }
    await box.fill(q)
    await panel.getByRole("button", { name: "Send" }).click()
    await page.waitForTimeout(300); await idle(); sent++
    const b = bodies[bodies.length - 1]
    md.push(`**Użytkownik:** ${q}`, "", `**Bot:** ${await lastBot()}`, "")
    if (moveTier2 && i === questions.length - 1) md.push(`➡️ Kontekst tej wiadomości: Tier 2 od €${b.context.tiers[2].fromEur}, ${b.context.tiers[2].customersPct}% klientów.`, "")
  }
  await shot("2-conversation")
  await page.close()
}

await botSession({
  name: "2. Bot tier plannera — dane przykładowe (droga B), 360 px",
  width: 360, url: "/tools/loyalty-tier-planner?d=s",
  questions: [
    "Which works better for Tier 1: a discount or a prestige benefit? And how much more will they spend because of it?",
    "I've just moved the Tier 2 threshold. What do you think now?",
  ],
  moveTier2: 2000,
})
await botSession({
  name: "3. Bot tier plannera — mały CSV (60 wierszy), 1280 px",
  width: 1280, url: "/tools/loyalty-tier-planner", csv: "maly-60-wierszy.csv",
  questions: ["Czy przy tych danych progi w ogóle mają sens?"],
})

// ── 4. Shared daily limit: keep sending (mixing modes) until 429 ──
md.push("## 4. Wspólny limit dzienny (oba tryby, to samo IP)", "")
const statuses = []
for (let i = 0; i < 20; i++) {
  const eva = i % 2 === 0
  const res = await ctx.request.post(`${origin}/api/chat`, { data: eva ? { messages: [{ role: "user", content: "Hi" }] } : { mode: "eva", messages: [{ role: "user", content: "Hi" }] } })
  statuses.push(res.status())
  if (res.status() === 429) {
    md.push(`Wiadomości wysłane do modelu przed tą próbą (w tym skrypcie): ${sent}. Odpowiedź: 429 \`${JSON.stringify(await res.json())}\``, "")
    // Same limit in the other mode
    const other = await ctx.request.post(`${origin}/api/chat`, { data: { mode: "tier-planner", messages: [], context: { tiers: [] } } })
    md.push(`Tryb tier-planner zaraz potem: ${other.status()}`, "")
    break
  }
  sent++
}
md.push(`Statusy kolejnych prób: ${statuses.join(", ")}`, "")
writeFileSync(join(dir, "transkrypty.md"), md.join("\n") + "\n")
console.log(md.join("\n"))
await browser.close()
