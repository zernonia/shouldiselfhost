#!/usr/bin/env node
/**
 * Tier-1 freshness bot: stars, last push, latest release, Docker pulls.
 * Writes data/metrics/*.json ONLY (bots never touch human-edited collections).
 * Zero LLM, zero cost. Runs nightly in CI with GITHUB_TOKEN for the rate limit.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, 'data/metrics');
mkdirSync(outDir, { recursive: true });

const token = process.env.GITHUB_TOKEN;
const ghHeaders = {
  accept: 'application/vnd.github+json',
  'user-agent': 'shouldiselfhost-metrics-bot',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: ghHeaders });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json();
}

async function dockerPulls(image) {
  if (!image) return null;
  try {
    const res = await fetch(`https://hub.docker.com/v2/repositories/${image}/`);
    if (!res.ok) return null;
    return (await res.json()).pull_count ?? null;
  } catch {
    return null;
  }
}

const alternatives = readdirSync(join(root, 'data/alternatives'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(root, 'data/alternatives', f), 'utf8')));

let ok = 0, failed = 0;
for (const alt of alternatives) {
  try {
    const [repo, release, pulls] = await Promise.all([
      gh(`/repos/${alt.repo}`),
      gh(`/repos/${alt.repo}/releases/latest`),
      dockerPulls(alt.docker_image),
    ]);
    const metrics = {
      id: alt.id,
      stars: repo?.stargazers_count ?? null,
      last_commit: repo?.pushed_at ?? null,
      latest_release: release
        ? { tag: release.tag_name, published_at: release.published_at, url: release.html_url }
        : null,
      docker_pulls: pulls,
      open_issues: repo?.open_issues_count ?? null,
      fetched_at: new Date().toISOString(),
    };
    writeFileSync(join(outDir, `${alt.id}.json`), JSON.stringify(metrics, null, 2) + '\n');
    ok++;
  } catch (e) {
    // Keep yesterday's file on transient failures — stale beats absent.
    console.error(`✗ ${alt.id}: ${e.message}`);
    failed++;
  }
}
console.log(`metrics: ${ok} written, ${failed} failed of ${alternatives.length}`);
if (failed > alternatives.length / 2) process.exit(1);
