import { chromium } from "playwright"
// Screenshots + horizontal-scroll + share-link check for the Loyalty Tier Planner.
// Usage: npm run build && npx next start -p 3100, then: node karty/raporty/tier-planner-24-09/check-mobile.mjs
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
const BASE = (process.env.BASE_URL ?? "http://localhost:3100") + "/tools/loyalty-tier-planner"
const OUT = dirname(fileURLToPath(import.meta.url))
let browser
browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})

async function open(width, query = "") {
  const page = await browser.newPage({ viewport: { width, height: width < 1024 ? 800 : 900 }, deviceScaleFactor: 1 })
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
  await page.goto(BASE + query, { waitUntil: "networkidle" })
  await page.waitForTimeout(300)
  const reject = page.getByRole("button", { name: /reject all/i })
  if (await reject.count()) { await reject.first().click(); await page.waitForTimeout(150) }
  page.errors = errors.filter((e) => !e.includes("404"))
  return page
}
const overflow = (page) => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))

async function scenario(page, name) {
  if (name === "B" || name === "B-extremes" || name === "change") await page.getByRole("radio", { name: "Try sample data" }).click()
  if (name === "B-extremes") await page.getByRole("switch", { name: /Exclude extreme customers/ }).click()
  if (name === "change") {
    await page.getByRole("button", { name: "Set as current programme" }).click()
    const field = page.getByRole("textbox", { name: "Spend to reach Tier 2" })
    await field.click(); await field.fill("1500"); await field.press("Enter")
    const f1 = page.getByRole("textbox", { name: "Spend to reach Tier 1" })
    await f1.click(); await f1.fill("450"); await f1.press("Enter")
  }
  await page.waitForTimeout(250)
}

const results = []
for (const name of ["A", "B", "B-extremes", "change"]) {
  for (const width of [360, 1280]) {
    const page = await open(width)
    await scenario(page, name)
    await page.screenshot({ path: `${OUT}/${width}-${name}.png`, fullPage: true })
    if (width === 360) {
      // Viewport-sized shots: top of page, chart, first result cards
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0) })
      await page.screenshot({ path: `${OUT}/${width}-${name}-top.png` })
      await page.locator("#tier-results").evaluate((el) => el.scrollIntoView({ behavior: "instant" }))
      await page.waitForTimeout(150)
      await page.screenshot({ path: `${OUT}/${width}-${name}-results.png` })
    }
    // Link round trip: the same URL in a fresh page must render the same results
    const url = page.url()
    const before = await page.locator("#tier-results").innerText()
    const again = await open(width, "?" + url.split("?")[1])
    const after = await again.locator("#tier-results").innerText()
    await again.close()
    results.push({ name, width, url: url.split("?")[1], errors: page.errors, urlRestoresState: before === after })
    await page.close()
  }
  for (const width of [360, 375, 390, 414]) {
    const page = await open(width)
    await scenario(page, name)
    const o = await overflow(page)
    // open a tooltip too
    await page.getByRole("button", { name: "More information" }).first().click()
    const o2 = await overflow(page)
    if (width === 360 && name === "A") await page.screenshot({ path: `${OUT}/360-tooltip.png` })
    results.push({ name, width, overflowOk: o.sw <= o.iw && o2.sw <= o2.iw, ...o })
    await page.close()
  }
}
console.log(JSON.stringify(results, null, 1))
await browser.close()
