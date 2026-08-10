#!/usr/bin/env node
/**
 * Monthly price sweep: for every app, fetch its price_source page and check whether the
 * stored monthly price still appears in the page text. Emits a markdown report of apps
 * whose stored price can no longer be found (likely price change or page redesign) plus
 * pages that stopped resolving. The workflow turns a non-empty report into an issue —
 * a human (or a Tier-3 session) re-checks and PRs the data fix. Fast catches are content:
 * every confirmed hike becomes a post.
 *
 * Deliberately dumb: no LLM, no scraping framework, generous timeouts, and it only ever
 * READS. Marketing pages block bots routinely, so fetch failures are reported separately
 * from price mismatches, not treated as changes.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const apps = readdirSync(join(root, 'data/apps'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(root, 'data/apps', f), 'utf8')));

/** Price variants worth looking for: 12, 12.0, 12.00, and thousands separators. */
function priceVariants(n) {
  const s = new Set([String(n), n.toFixed(2)]);
  if (Number.isInteger(n)) s.add(n.toFixed(0));
  return [...s];
}

const missing = [];
const unreachable = [];
let checked = 0;

for (const app of apps) {
  if (!app.price_source?.startsWith('http')) continue;
  checked++;
  let text;
  try {
    const res = await fetch(app.price_source, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; shouldiselfhost-price-sweep; +https://shouldiselfhost.com)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = (await res.text()).replace(/\s+/g, ' ');
  } catch (e) {
    unreachable.push(`- ${app.id}: ${app.price_source} — ${e.message}`);
    continue;
  }
  const found = priceVariants(app.price_usd_mo).some((v) => text.includes(v));
  if (!found) {
    missing.push(`- **${app.id}** (${app.price_plan ?? 'plan?'}): stored \$${app.price_usd_mo}/mo not found on ${app.price_source} (checked ${app.price_checked}) — verify and PR the new price`);
  }
}

console.error(`sweep: ${checked} checked, ${missing.length} suspect, ${unreachable.length} unreachable`);
if (missing.length || unreachable.length) {
  const parts = ['Monthly price sweep — stored prices that no longer appear on their source page. A missing string is a *lead*, not proof: pages get redesigned. Verify by hand, then PR `price_usd_mo` + `price_checked` (derived numbers recalculate themselves).\n'];
  if (missing.length) parts.push(`## Suspected changes (${missing.length})\n\n${missing.join('\n')}`);
  if (unreachable.length) parts.push(`\n## Unreachable pages (${unreachable.length}) — bot-blocked or moved\n\n${unreachable.join('\n')}`);
  console.log(parts.join('\n'));
}
