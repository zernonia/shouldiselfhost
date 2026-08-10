#!/usr/bin/env node
/**
 * Tier-2 triage: for alternatives that shipped a release in the last 24h, ask Haiku whether
 * the release could plausibly change a verdict (capability/effort/health), and emit a
 * markdown report to stdout. The workflow turns a non-empty report into a GitHub issue for
 * a human to act on — the bot never edits verdicts (Claude proposes, humans merge).
 *
 * Model pinned; direct API with tiny outputs (~$2-3/mo at our volume). Move to the Batch API
 * if the nightly volume ever grows past a handful of releases.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MODEL = 'claude-haiku-4-5-20251001'; // pinned — Tier 2 is Haiku by policy (CLAUDE.md)
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) { console.error('ANTHROPIC_API_KEY required'); process.exit(1); }

const root = new URL('..', import.meta.url).pathname;
const load = (dir) => readdirSync(join(root, dir)).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(root, dir, f), 'utf8')));

const apps = load('data/apps');
const metrics = load('data/metrics');
const dayAgo = Date.now() - 86400000;

const fresh = metrics.filter((m) => m.latest_release && +new Date(m.latest_release.published_at) > dayAgo);
if (!fresh.length) { console.error('no releases in the last 24h'); process.exit(0); }

const lines = [];
for (const m of fresh) {
  const affected = apps.filter((a) => a.verdict && a.alternatives.includes(m.id));
  if (!affected.length) continue;

  const prompt = `A self-hosted app just released ${m.latest_release.tag} (${m.latest_release.url}).
It is the ranked alternative on these verdict pages:
${affected.map((a) => `- ${a.name}: verdict ${a.verdict} — "${a.verdict_reason}" (jobs: ${a.jobs.join(', ')})`).join('\n')}

Based only on the release tag/URL and typical semver conventions: is this plausibly a major
release that could change capability, setup effort, or project health enough to warrant a human
re-check of any verdict above? Answer with one line: "RECHECK: <why>" or "SKIP: <why>".`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 150, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) { console.error(`API ${res.status} for ${m.id}`); continue; }
  const answer = (await res.json()).content?.[0]?.text?.trim() ?? '';
  if (answer.startsWith('RECHECK')) {
    lines.push(`- **${m.id}** ${m.latest_release.tag} (${m.latest_release.url}) — ${answer.slice(8).trim()}\n  affects: ${affected.map((a) => a.id).join(', ')}`);
  }
}

if (lines.length) {
  console.log(`Releases in the last 24h that may change a verdict (Haiku triage — a human decides):\n\n${lines.join('\n')}`);
}
