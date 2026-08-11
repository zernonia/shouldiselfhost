#!/usr/bin/env node
// Second-pass app logos: official GitHub org avatars for SaaS brands that
// simple-icons no longer carries (trademark removals) → public/logos/apps/{id}.png
// AppTile.vue resolution order: {id}.svg (simple-icons) → {id}.png (this) → gradient tile.
import { writeFile, mkdir, access } from 'node:fs/promises'

const ORG = {
  'slack': 'slackhq', 'chatgpt': 'openai', 'microsoft-365-personal': 'microsoft',
  'adobe-acrobat': 'adobe', 'adobe-lightroom': 'adobe', 'docusign': 'docusign',
  'monday-com': 'mondaycom', 'amplitude': 'amplitude', 'pipedrive': 'pipedrive',
  'midjourney': 'midjourney', 'jotform': 'jotform', 'activecampaign': 'activecampaign',
  'raindrop': 'raindropio', 'slab': 'slab', 'everand': 'scribd',
  'lokalise': 'lokalise', 'tooljet-cloud': 'tooljet', 'tolgee-cloud': 'tolgee',
  'monarch-money': 'monarchmoney', 'freshbooks': 'freshbooks', 'pandadoc': 'PandaDoc',
  'acuity-scheduling': 'squarespace', 'cronitor': 'cronitorio', 'uptimerobot': 'uptimerobot',
  'myfitnesspal-premium': 'myfitnesspal', 'canny': 'canny', 'doodle': 'DoodleScheduling',
  'transistor-fm': 'TransistorFM', 'day-one': 'dayoneapp', 'ynab': 'ynab',
  'whimsical': 'whimsical', 'chatbase': 'chatbase-co', 'sync-com': 'sync',
  'anylist-complete': 'anylist', 'wanderlog-pro': 'wanderlog', 'zight': 'CloudApp',
  'uptime': 'uptime-com',
}

await mkdir('public/logos/apps', { recursive: true })
let ok = 0
const failed = []
for (const [id, org] of Object.entries(ORG)) {
  try { await access(`public/logos/apps/${id}.svg`); continue } catch {} // simple-icons already won
  try {
    const res = await fetch(`https://avatars.githubusercontent.com/${org}?s=128`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 500) throw new Error('empty')
    await writeFile(`public/logos/apps/${id}.png`, buf)
    ok++
  } catch (e) { failed.push(`${id}(${org})`) }
}
console.log(`gh-avatar logos: ${ok} fetched`)
if (failed.length) console.log('still tile-fallback:', failed.join(', '))
