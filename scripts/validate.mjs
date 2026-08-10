#!/usr/bin/env node
/**
 * Validates everything under data/ against schemas/ plus the referential and rubric rules
 * CI enforces. Exit 1 on any error. Run: npm run validate
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  rubric, breakEvenMonths, DEFAULT_HOURLY_RATE,
  YES_SETUP_CEILING_MIN, KINDA_SETUP_CEILING_MIN, BREAK_EVEN_WINDOW_MO,
} from '../shared/derive.mjs';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
const warnings = [];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const schema = (name) =>
  ajv.compile(JSON.parse(readFileSync(join(root, 'schemas', `${name}.schema.json`), 'utf8')));

const validators = {
  app: schema('app'),
  alternative: schema('alternative'),
  metrics: schema('metrics'),
  changelog: schema('changelog'),
};

function loadDir(dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((f) => f.endsWith('.json')).map((f) => {
    const path = join(dir, f);
    try {
      return { file: path, json: JSON.parse(readFileSync(join(root, path), 'utf8')) };
    } catch (e) {
      errors.push(`${path}: invalid JSON — ${e.message}`);
      return null;
    }
  }).filter(Boolean);
}

const apps = loadDir('data/apps');
const alternatives = loadDir('data/alternatives');
const metrics = loadDir('data/metrics');

// 1. Schema validation + id-matches-filename
for (const [kind, records] of [['app', apps], ['alternative', alternatives], ['metrics', metrics]]) {
  for (const { file, json } of records) {
    if (!validators[kind](json)) {
      for (const err of validators[kind].errors) {
        errors.push(`${file}: ${err.instancePath || '/'} ${err.message}`);
      }
    }
    if (json.id !== basename(file, '.json')) {
      errors.push(`${file}: id "${json.id}" does not match filename`);
    }
  }
}

// 2. Changelog
const changelogPath = join(root, 'data/changelog.json');
let changelog = [];
if (existsSync(changelogPath)) {
  changelog = JSON.parse(readFileSync(changelogPath, 'utf8'));
  if (!validators.changelog(changelog)) {
    for (const err of validators.changelog.errors) {
      errors.push(`data/changelog.json: ${err.instancePath || '/'} ${err.message}`);
    }
  }
}

// 3. Referential integrity
const altIds = new Set(alternatives.map((a) => a.json.id));
const appIds = new Set(apps.map((a) => a.json.id));
const metricsById = Object.fromEntries(metrics.map((m) => [m.json.id, m.json]));

for (const { file, json: app } of apps) {
  for (const altId of app.alternatives ?? []) {
    if (!altIds.has(altId)) errors.push(`${file}: alternative "${altId}" has no data/alternatives/${altId}.json`);
  }
  if (app.compose && !existsSync(join(root, app.compose))) {
    errors.push(`${file}: compose file "${app.compose}" does not exist`);
  }
  for (const ev of app.verified?.evidence ?? []) {
    if (!existsSync(join(root, ev))) errors.push(`${file}: evidence "${ev}" does not exist`);
  }

  // 4. Rubric consistency — a verdict may not contradict its own inputs
  if (app.verdict) {
    const r = rubric(app, metricsById[app.alternatives?.[0]], DEFAULT_HOURLY_RATE);
    if (app.verdict === 'YES') {
      if (r.setup_min == null || r.setup_min > YES_SETUP_CEILING_MIN) {
        errors.push(`${file}: verdict YES but setup_min ${r.setup_min} exceeds the ${YES_SETUP_CEILING_MIN}-minute ceiling`);
      }
      if (!r.economics) {
        errors.push(`${file}: verdict YES but break-even ${r.break_even_months == null ? 'never happens' : `${r.break_even_months.toFixed(1)}mo`} (window: ${BREAK_EVEN_WINDOW_MO}mo)`);
      }
      if (!r.health) errors.push(`${file}: verdict YES but primary alternative is flagged abandoned`);
    }
    if (app.verdict === 'KINDA' && r.setup_min != null && r.setup_min > KINDA_SETUP_CEILING_MIN) {
      errors.push(`${file}: verdict KINDA but setup_min ${r.setup_min} exceeds the one-weekend ceiling (${KINDA_SETUP_CEILING_MIN} min)`);
    }
    if (app.verdict === 'NOT_REALLY' && r.economics && r.effort_yes && r.health) {
      warnings.push(`${file}: verdict NOT_REALLY but all rubric inputs pass — verdict_reason had better carry it (capability gap?)`);
    }
  }
}

for (const { file, json } of metrics) {
  if (!altIds.has(json.id)) warnings.push(`${file}: metrics for unknown alternative "${json.id}"`);
}
for (const entry of changelog) {
  if (!appIds.has(entry.app)) errors.push(`data/changelog.json: unknown app "${entry.app}"`);
}

// 5. Every scored verdict's current state must be reachable from the changelog tail
for (const { file, json: app } of apps) {
  if (app.verdict) {
    const last = changelog.filter((c) => c.app === app.id).at(-1);
    if (!last) {
      errors.push(`${file}: verdict ${app.verdict} but no data/changelog.json entry (verdicts need a visible changelog)`);
    } else if (last.to !== app.verdict) {
      errors.push(`${file}: verdict ${app.verdict} but latest changelog entry says ${last.to}`);
    }
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error(s) across ${apps.length} apps, ${alternatives.length} alternatives.`);
  process.exit(1);
}
console.log(`✓ data valid: ${apps.length} apps (${apps.filter((a) => a.json.verdict).length} scored), ${alternatives.length} alternatives, ${metrics.length} metrics records.`);
