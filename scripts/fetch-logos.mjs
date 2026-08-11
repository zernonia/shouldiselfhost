#!/usr/bin/env node
// Vendors OSS alternative logos from GitHub avatars (org/user of each repo).
// Idempotent: skips files that already exist. Run after adding alternatives.
import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'

const ALTS = 'data/alternatives'
const OUT = 'public/logos'
await mkdir(OUT, { recursive: true })

let fetched = 0, skipped = 0, failed = []
for (const f of (await readdir(ALTS)).filter((f) => f.endsWith('.json'))) {
  const alt = JSON.parse(await readFile(join(ALTS, f), 'utf8'))
  const owner = alt.repo?.split('/')[0]
  if (!owner) continue
  const dest = join(OUT, `${alt.id}.png`)
  try { await access(dest); skipped++; continue } catch {}
  try {
    const res = await fetch(`https://avatars.githubusercontent.com/${owner}?s=128`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    fetched++
  } catch (e) {
    failed.push(`${alt.id} (${owner}): ${e.message}`)
  }
}
console.log(`logos: ${fetched} fetched, ${skipped} already present${failed.length ? `, ${failed.length} failed` : ''}`)
for (const f of failed) console.log('  ✗', f)
