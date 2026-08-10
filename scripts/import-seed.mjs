#!/usr/bin/env node
/**
 * Imports the capability layer (app → replacement pairings, pricing snapshots) from a local
 * checkout of github.com/caniselfhostit/caniselfhostit (MIT, © Jashanpreet Singh — attributed
 * in data/site.json and on every page that renders seeded records).
 *
 * Idempotent, and it NEVER overwrites our decision layer: on apps that already carry a verdict,
 * only pricing/name/link fields refresh; verdict, economics, jobs, verified, alternatives and
 * every other CC BY-SA field we authored stay untouched.
 *
 * Usage: node scripts/import-seed.mjs /path/to/caniselfhostit
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const seedRoot = process.argv[2];
if (!seedRoot || !existsSync(join(seedRoot, 'data/saas'))) {
  console.error('usage: node scripts/import-seed.mjs /path/to/caniselfhostit (with data/saas + data/projects)');
  process.exit(1);
}

// MIT check — do not import if the license we verified ever changes out from under us.
const license = readFileSync(join(seedRoot, 'LICENSE'), 'utf8');
if (!/MIT License/i.test(license)) {
  console.error('Seed repo LICENSE is not MIT — refusing to import. Re-verify before proceeding.');
  process.exit(1);
}

const root = new URL('..', import.meta.url).pathname;
for (const d of ['data/apps', 'data/alternatives', 'data/metrics']) mkdirSync(join(root, d), { recursive: true });

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, obj) => writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');

// --- Projects → data/alternatives/ ---
const projectsDir = join(seedRoot, 'data/projects');
const projects = {};
let altNew = 0, altUpdated = 0;
for (const slug of readdirSync(projectsDir)) {
  const idx = join(projectsDir, slug, 'index.json');
  if (!existsSync(idx)) continue;
  const p = readJson(idx);
  projects[p.slug] = p;

  // Docker Hub image from their sources.image URL when present
  let dockerImage;
  const m = (p.sources?.image ?? '').match(/hub\.docker\.com\/(?:r\/([\w.-]+\/[\w.-]+)|_\/([\w.-]+))/);
  if (m) dockerImage = m[1] ?? `library/${m[2]}`;

  const out = {
    id: p.slug,
    name: p.name,
    ...(p.tagline ? { tagline: p.tagline } : {}),
    repo: p.repo,
    ...(p.site ? { site: p.site } : {}),
    ...(dockerImage ? { docker_image: dockerImage } : {}),
    ...(p.license ? { license: p.license } : {}),
    category: p.category ?? 'uncategorized',
    resources: {
      ...(p.resources?.ramMinMB != null ? { ram_min_mb: p.resources.ramMinMB } : {}),
      ...(p.resources?.diskGB != null ? { disk_gb: p.resources.diskGB } : {}),
      ...(p.resources?.arm64 != null ? { arm64: p.resources.arm64 } : {}),
      ...(p.tierFactors?.containers != null ? { containers: p.tierFactors.containers } : {}),
      ...(p.tierFactors?.externalDb != null ? { external_db: p.tierFactors.externalDb } : {}),
    },
    provenance: { capability_seed: 'caniselfhostit', decision_layer: 'original' },
  };

  const dest = join(root, 'data/alternatives', `${p.slug}.json`);
  if (existsSync(dest)) {
    const existing = readJson(dest);
    if (existing.provenance?.capability_seed !== 'caniselfhostit') continue; // ours — leave alone
    writeJson(dest, { ...out, ...(existing.notes ? { notes: existing.notes } : {}) });
    altUpdated++;
  } else {
    writeJson(dest, out);
    altNew++;
  }
}

// --- SaaS → data/apps/ ---
let appNew = 0, appRefreshed = 0, appSkipped = 0;
for (const file of readdirSync(join(seedRoot, 'data/saas'))) {
  if (!file.endsWith('.json')) continue;
  const s = readJson(join(seedRoot, 'data/saas', file));
  const ranked = (s.ranked ?? []).filter((r) => projects[r.project]);
  if (!ranked.length) { appSkipped++; continue; }

  // Reference plan: the one their primary pairing targets, else cheapest paid plan.
  const plans = (s.plans ?? []).filter((pl) => pl.priceMonthly > 0);
  const refPlan =
    plans.find((pl) => pl.name === ranked[0].plan) ??
    plans.sort((a, b) => a.priceMonthly - b.priceMonthly)[0];
  if (!refPlan) { appSkipped++; continue; }

  const primary = projects[ranked[0].project];
  const seedFields = {
    name: s.name,
    ...(s.domain ? { domain: s.domain } : {}),
    category: primary.category ?? 'uncategorized',
    price_usd_mo: refPlan.priceMonthly,
    price_plan: refPlan.name,
    ...(refPlan.unit ? { price_unit: refPlan.unit } : {}),
    price_source: s.pricing?.source ?? `https://${s.domain}`,
    price_checked: s.pricing?.checkedOn ?? new Date().toISOString().slice(0, 10),
    links: { caniselfhostit: `https://caniselfhostit.com/${s.slug}` },
  };

  const dest = join(root, 'data/apps', `${s.slug}.json`);
  if (existsSync(dest)) {
    const existing = readJson(dest);
    if (existing.verdict != null) {
      // Scored: refresh pricing/link fields only; the decision layer is ours.
      writeJson(dest, { ...existing, ...seedFields, id: existing.id, jobs: existing.jobs, category: existing.category });
      appRefreshed++;
      continue;
    }
    writeJson(dest, { ...existing, ...seedFields, id: existing.id });
    appRefreshed++;
  } else {
    writeJson(dest, {
      id: s.slug,
      ...seedFields,
      jobs: [],
      verdict: null,
      alternatives: ranked.map((r) => r.project),
      provenance: { capability_seed: 'caniselfhostit', decision_layer: 'original' },
    });
    appNew++;
  }
}

console.log(`alternatives: ${altNew} new, ${altUpdated} refreshed`);
console.log(`apps: ${appNew} new, ${appRefreshed} refreshed, ${appSkipped} skipped (no importable pairing/plan)`);
