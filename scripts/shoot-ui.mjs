// Boot each screenshot-friendly alternative from its verified compose file,
// drive past login/setup with Playwright, capture the real UI → public/shots/{alt}.webp
import { chromium } from 'playwright-core'
import { execSync } from 'node:child_process'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/shots', { recursive: true })
const sh = (cmd) => execSync(cmd, { stdio: 'pipe', timeout: 600000 }).toString()

// { alt, compose, url, flow(page) }  — flow leaves the page showing the real UI
const TARGETS = [
  { alt: 'excalidraw', compose: 'miro-excalidraw', url: 'http://localhost:8087/', flow: async (p) => {
    await p.waitForTimeout(2500) } },
  { alt: 'drawio', compose: 'whimsical-drawio', url: 'http://localhost:8093/?offline=1&splash=0&libraries=1', flow: async (p) => {
    await p.waitForTimeout(2500)
    const btn = p.locator('text=Create New Diagram')
    if (await btn.count()) { await btn.first().click(); await p.waitForTimeout(800)
      const ok = p.locator('button:has-text("Create")'); if (await ok.count()) await ok.first().click() }
    await p.waitForTimeout(2000) } },
  { alt: 'stirling-pdf', compose: 'adobe-acrobat-stirling-pdf', url: 'http://localhost:8092/', flow: async (p) => {
    await p.waitForTimeout(3000) } },
  { alt: 'gatus', compose: 'uptime-gatus', url: 'http://localhost:8099/', flow: async (p) => {
    await p.waitForTimeout(35000); await p.reload(); await p.waitForTimeout(2500) } }, // let one check cycle land
  { alt: 'grist', compose: 'airtable-grist', url: 'http://localhost:8484/', flow: async (p) => {
    await p.waitForTimeout(3500) } },
  { alt: 'uptime-kuma', compose: 'pingdom-uptime-kuma', url: 'http://localhost:3001/', flow: async (p) => {
    await p.waitForTimeout(2500)
    if (await p.locator('input[placeholder*="sername"], #floatingInput').count()) {
      await p.fill('#floatingInput', 'admin').catch(() => {})
      await p.fill('#repeat', 'changeme123AA!').catch(() => {})
      await p.fill('#floatingPassword', 'changeme123AA!').catch(() => {})
      await p.click('button[type=submit]').catch(() => {})
      await p.waitForTimeout(3000) } } },
  { alt: 'memos', compose: 'day-one-memos', url: 'http://localhost:5230/', flow: async (p) => {
    await p.waitForTimeout(2000)
    if (await p.locator('input[placeholder*="sername" i]').count()) {
      await p.fill('input[placeholder*="sername" i]', 'admin')
      await p.fill('input[type=password]', 'changeme123')
      await p.click('button:has-text("Sign up")').catch(async () => p.click('button[type=submit]'))
      await p.waitForTimeout(3000) } } },
  { alt: 'miniflux', compose: 'inoreader-miniflux', url: 'http://localhost:8084/', flow: async (p) => {
    await p.waitForTimeout(1500)
    if (await p.locator('#form-username').count()) {
      await p.fill('#form-username', 'admin'); await p.fill('#form-password', 'changeme-now')
      await p.click('button[type=submit]'); await p.waitForTimeout(2500) } } },
  { alt: 'kimai', compose: 'toggl-kimai', url: 'http://localhost:8001/', flow: async (p) => {
    await p.waitForTimeout(2000)
    if (await p.locator('#username').count()) {
      await p.fill('#username', 'admin@example.com'); await p.fill('#password', 'changeme123')
      await p.click('button[type=submit]'); await p.waitForTimeout(3500) } } },
]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const results = []
for (const t of TARGETS) {
  const file = `compose/${t.compose}.yml`
  const proj = `shot-${t.alt}`
  try {
    console.log(`── ${t.alt}: booting ${file}`)
    sh(`docker compose -p ${proj} -f ${file} up -d --wait --quiet-pull`)
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
    await page.goto(t.url, { waitUntil: 'load', timeout: 45000 })
    await t.flow(page)
    const png = await page.screenshot({ type: 'png' })
    await sharp(png).resize(1280).webp({ quality: 82 }).toFile(`public/shots/${t.alt}.webp`)
    await page.close()
    results.push(`✓ ${t.alt}`)
  } catch (e) {
    results.push(`✗ ${t.alt}: ${String(e.message).slice(0, 120)}`)
  } finally {
    try { sh(`docker compose -p ${proj} -f ${file} down -v --remove-orphans`) } catch {}
  }
}
await browser.close()
console.log(results.join('\n'))
