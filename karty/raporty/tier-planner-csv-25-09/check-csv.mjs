// Playwright check for the CSV path: screenshots at 360 and 1280 px, no horizontal scroll,
// and no network request carrying the file. Usage: BASE=http://localhost:3000 node check-csv.mjs
// (needs playwright-core; CHROME=/path/to/chrome if it is not on the default path)
import { chromium } from "playwright-core"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const dir = dirname(fileURLToPath(import.meta.url))
const files = join(dir, "pliki-testowe")
const BASE = process.env.BASE ?? "http://localhost:3000"
const URL = `${BASE}/tools/loyalty-tier-planner`
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium" })
const report = []
const log = (...a) => { const line = a.join(" "); report.push(line); console.log(line) }
let failed = false
const check = (ok, what) => { log(ok ? "✅" : "❌", what); if (!ok) failed = true }

async function noHorizontalScroll(page, what) {
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  check(sw <= iw, `${what}: no horizontal scroll (${sw} ≤ ${iw})`)
}

for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: width < 1024 ? 780 : 900 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: "networkidle" })
  // Cookie banner off, so it does not cover the screenshots
  await page.getByRole("button", { name: /reject all/i }).click({ timeout: 5_000 }).catch(() => {})

  // Every request made after the page has loaded; none may carry the file
  const requests = []
  page.on("request", (r) => requests.push({ method: r.method(), url: r.url(), body: r.postData() ?? "" }))

  const shot = async (name) => {
    await page.screenshot({ path: join(dir, `${width}-${name}.png`), fullPage: true })
    // Viewport view from "Your customers": what the user sees right after the upload, before scrolling to results
    await page.getByText("Your customers", { exact: true }).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70))
    await page.screenshot({ path: join(dir, `${width}-${name}-top.png`) })
  }
  const upload = async (file) => {
    const t0 = Date.now()
    await page.setInputFiles('input[type="file"]', join(files, file))
    await page.waitForFunction(() => !document.querySelector(".tp-spin"), null, { timeout: 30_000 })
    return Date.now() - t0
  }

  // Paths A and B still work as before
  const topA = await page.locator("#tier-results").getByText(/^Top tier/).innerText()
  await page.getByRole("radio", { name: "Try sample data" }).click()
  const extremesB = await page.getByText(/^Found: 18 customers/).count()
  check(topA.length > 0 && extremesB === 1, `${width} paths A and B: results shown, sample data still flags 18 extreme customers`)

  await page.getByRole("radio", { name: "Upload your own data (CSV)" }).click()
  await page.getByRole("button", { name: "Choose a CSV file" }).waitFor()
  await noHorizontalScroll(page, `${width} empty`)
  await shot("1-empty")

  await upload("2-zly-naglowek.csv")
  const alert = await page.locator("#tier-inputs").getByRole("alert").innerText()
  check(alert.includes("We couldn't find a column named 'annual_spend'. Please use the template."), `${width} header error shown: ${JSON.stringify(alert.split("\n").pop())}`)
  check(await page.locator("#tier-results").getByText("Upload a CSV file to see your tiers").isVisible(), `${width} header error: no results computed`)
  await noHorizontalScroll(page, `${width} header error`)
  await shot("2-header-error")

  await upload("3-mieszany.csv")
  const mixed = await page.getByText(/rows loaded/).innerText()
  check(mixed === "400 rows loaded, 26 rows skipped (11: invalid spend, 9: missing values, 6: zero purchases with spend).", `${width} mixed file: ${mixed}`)
  await noHorizontalScroll(page, `${width} mixed`)
  await shot("3-mixed")

  const ms = await upload("4-ponad-50000.csv")
  const sampleNotes = await page.getByText(/random sample of 50,000 out of 80,000 rows/).count()
  check(sampleNotes >= 2, `${width} sampling: message under the upload zone and at the results (${sampleNotes}×), loaded in ${ms} ms`)
  const customers = await page.locator("#tier-results").getByText(/^\d[\d,]*$/).allInnerTexts()
  log(`   ${width} sampled file: tier customer counts ${customers.join(" / ")} (scaled to 80,000)`)
  await noHorizontalScroll(page, `${width} sampled`)
  await shot("4-sampled")

  // Moving a threshold on the sampled file (50,000 customers). At 360 px the CPU is slowed 4× to mimic a phone.
  const cdp = width < 1024 ? await page.context().newCDPSession(page) : null
  if (cdp) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
  const slider = page.locator('input[type="range"]').first()
  const field = page.locator('input[aria-label^="Spend to reach"]').first()
  await slider.focus()
  const steps = []
  for (let i = 0; i < 5; i++) {
    const t0 = Date.now()
    await page.keyboard.press("ArrowRight")
    const target = await field.inputValue()
    const tInput = Date.now() - t0
    // Tier card headers come from the (deferred) results: wait until they show the new threshold
    await page.locator("#tier-results").getByText(`from ${target}`, { exact: true }).first().waitFor({ timeout: 20_000 })
    steps.push(`${tInput}/${Date.now() - t0}`)
  }
  if (cdp) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 })
  log(`   ${width}${cdp ? " (CPU ×4 slower)" : ""} slider step on 50,000 customers, ms until thumb/field moved / until tier cards updated: ${steps.join(", ")}`)

  await upload("1-poprawny.csv")
  check(await page.getByText("2,000 rows loaded, 0 rows skipped").isVisible(), `${width} valid template file loaded`)
  check(await page.getByText(/random sample of 50,000 out of/).count() === 0, `${width} replacing the file clears the sampling message`)
  await noHorizontalScroll(page, `${width} valid`)
  await shot("5-valid")
  const hide = await page.addStyleTag({ content: "header, nav, .tp-sticky { visibility: hidden !important; }" })
  await page.locator("#tier-results").screenshot({ path: join(dir, `${width}-5-valid-tier-cards.png`) })
  await hide.evaluate((el) => el.remove())

  // Share link: settings only, and a note in the UI
  check(await page.getByText("The link keeps your programme settings but not your uploaded data.").isVisible(), `${width} share note visible for CSV`)
  const link = page.url()
  check(link.includes("d=c") && !link.includes("C000001"), `${width} URL has d=c and no data`)
  const other = await browser.newPage({ viewport: { width, height: 780 } })
  await other.goto(link, { waitUntil: "networkidle" })
  check(await other.getByText("This link keeps the programme settings but not the data.").isVisible(), `${width} opened link asks for the file`)
  await other.close()

  const leaked = requests.filter((r) => r.method !== "GET" || r.body.length > 0 || /C0000|annual_spend|\d{3}\.\d{2},\d+/.test(r.url))
  check(leaked.length === 0, `${width} no request sends file contents (${requests.length} requests after load: ${[...new Set(requests.map((r) => new globalThis.URL(r.url).pathname))].join(", ") || "none"})`)
  check(errors.length === 0, `${width} no JS errors${errors.length ? ": " + errors.join("; ") : ""}`)
  await page.close()
}

await browser.close()
if (failed) process.exit(1)
