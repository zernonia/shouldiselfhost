#!/usr/bin/env node
// Generates real brand-mark tiles for SaaS apps from simple-icons (official glyphs
// + brand hex), emitted as self-contained SVGs → public/logos/apps/{id}.svg.
// Dark-theme aware: glyphs too dark for the OLED background get lifted to white.
// Apps without a simple-icons match keep the gradient-tile fallback in AppTile.vue.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import * as si from 'simple-icons'

const OUT = 'public/logos/apps'
await mkdir(OUT, { recursive: true })

// id → simple-icons slug where the obvious normalizations don't land
const OVERRIDES = {
  'adobe-acrobat': 'adobeacrobatreader', 'adobe-lightroom': 'adobelightroom',
  'google-one-immich': 'googleone', 'google-one': 'googleone',
  'google-workspace-business-starter': 'google', 'google-analytics': 'googleanalytics',
  'microsoft-365-personal': 'microsoft365', 'monday-com': 'mondaydotcom',
  'day-one': 'dayone', 'home-assistant-cloud': 'homeassistant',
  'github-copilot': 'githubcopilot', 'kit': 'convertkit',
  'sync-com': 'sync', 'transistor-fm': 'transistor', 'quickbooks-online': 'quickbooks',
  'myfitnesspal-premium': 'myfitnesspal', 'matomo-cloud': 'matomo',
  'baserow-cloud': 'baserow', 'tolgee-cloud': 'tolgee', 'tooljet-cloud': 'tooljet',
  'umami-cloud': 'umami', 'obsidian-sync': 'obsidian', 'acuity-scheduling': 'acuityscheduling',
  'fathom-analytics': 'fathom', 'anylist-complete': 'anylist', 'flickr-pro': 'flickr',
  'wanderlog-pro': 'wanderlog', 'box-personal-pro': 'box', 'roam-research': 'roamresearch',
  'toggl-track': 'toggltrack', 'nordvpn': 'nordvpn', 'backblaze-personal-backup': 'backblaze',
  '1password': '1password', 'ghost-pro': 'ghost', 'grafana-cloud': 'grafana',
  'squarespace': 'squarespace', 'evernote': 'evernote', 'linktree': 'linktree',
}

const bySlug = {}
for (const icon of Object.values(si)) if (icon?.slug) bySlug[icon.slug] = icon

// Perceived luminance; lift near-black glyphs for the dark theme
function luminance(hex) {
  const n = parseInt(hex, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

const apps = (await readdir('data/apps')).filter((f) => f.endsWith('.json'))
let hit = 0
const missed = []
for (const f of apps) {
  const app = JSON.parse(await readFile(`data/apps/${f}`, 'utf8'))
  const candidates = [
    OVERRIDES[app.id],
    app.id.replace(/-/g, ''),
    app.id.split('-')[0],
    app.name?.toLowerCase().replace(/[^a-z0-9]/g, ''),
  ].filter(Boolean)
  const icon = candidates.map((c) => bySlug[c]).find(Boolean)
  if (!icon) { missed.push(app.id); continue }
  const fill = luminance(icon.hex) < 0.16 ? 'f2f3f5' : icon.hex
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="${app.name} logo">
  <rect width="48" height="48" rx="12" fill="#${icon.hex}" fill-opacity="0.14"/>
  <rect width="48" height="48" rx="12" fill="none" stroke="rgba(255,255,255,0.1)"/>
  <g transform="translate(11,11)"><path transform="scale(1.0833)" fill="#${fill}" d="${icon.path}"/></g>
</svg>
`
  await writeFile(`${OUT}/${app.id}.svg`, svg)
  hit++
}
console.log(`app logos: ${hit}/${apps.length} matched to real brand marks`)
if (missed.length) console.log('tile fallback for:', missed.join(', '))
