#!/usr/bin/env node
/**
 * Build-time OG card generation: one 1200x630 PNG per app + a site default.
 * The card carries the verdict badge and the derived math (net saving, break-even,
 * Markup Index) — same derive.mjs as everything else, golden rule applies.
 * Output: public/og/<id>.png (gitignored; regenerated every build).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  netMonthlySavingUsd, breakEvenMonths, markupIndex, DEFAULT_HOURLY_RATE,
} from '../shared/derive.mjs';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, 'public/og');
mkdirSync(outDir, { recursive: true });

const fonts = [
  { name: 'Mono', data: readFileSync(join(root, 'assets/fonts/JetBrainsMono-Regular.ttf')), weight: 400, style: 'normal' },
  { name: 'Mono', data: readFileSync(join(root, 'assets/fonts/JetBrainsMono-Bold.ttf')), weight: 700, style: 'normal' },
];

const C = {
  bg: '#0b0e14', card: '#161c29', border: '#232b3d', text: '#e6e9f0', dim: '#8b94a7',
  yes: '#3fd68f', kinda: '#f5b944', no: '#f06a6a', accent: '#6ea8fe',
};
const VERDICT = {
  YES: { label: 'YES', sub: 'worth it', color: C.yes },
  KINDA: { label: 'KINDA', sub: 'worth it if…', color: C.kinda },
  NOT_REALLY: { label: 'NOT REALLY', sub: 'keep paying', color: C.no },
  null: { label: 'NOT SCORED YET', sub: 'your PR here', color: C.dim },
};

const el = (type, style, children) => ({ type, props: { style, children } });
const money = (n) => (n == null ? '—' : `$${n.toFixed(2)}`);

function card(app) {
  const v = VERDICT[app?.verdict ?? 'null'] ?? VERDICT.null;
  const saving = app?.economics ? netMonthlySavingUsd(app, DEFAULT_HOURLY_RATE) : null;
  const be = app ? breakEvenMonths(app, DEFAULT_HOURLY_RATE) : null;
  const mi = app?.economics ? markupIndex(app, DEFAULT_HOURLY_RATE) : null;

  const stat = (label, value, color = C.text) =>
    el('div', { display: 'flex', flexDirection: 'column', backgroundColor: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: '22px 30px', flexGrow: 1 }, [
      el('div', { display: 'flex', fontSize: 22, color: C.dim }, label),
      el('div', { display: 'flex', fontSize: 40, fontWeight: 700, color, marginTop: 6 }, value),
    ]);

  return el('div', {
    width: 1200, height: 630, display: 'flex', flexDirection: 'column',
    backgroundColor: C.bg, color: C.text, fontFamily: 'Mono', padding: '52px 64px',
  }, [
    el('div', { display: 'flex', justifyContent: 'space-between', fontSize: 26 }, [
      el('div', { display: 'flex', fontWeight: 700 }, 'shouldiselfhost?'),
      el('div', { display: 'flex', color: C.dim }, app ? `$${app.price_usd_mo}/mo` : 'the decision layer'),
    ]),
    el('div', { display: 'flex', fontSize: 34, color: C.dim, marginTop: 48 }, 'Should I self-host'),
    el('div', { display: 'flex', fontSize: app && app.name.length > 14 ? 64 : 84, fontWeight: 700, marginTop: 4 },
      app ? `${app.name}?` : 'it?'),
    el('div', { display: 'flex', alignItems: 'center', marginTop: 34 }, [
      el('div', {
        display: 'flex', alignItems: 'baseline', border: `4px solid ${v.color}`, color: v.color,
        borderRadius: 16, padding: '14px 30px', fontSize: 54, fontWeight: 700,
      }, [
        el('div', { display: 'flex' }, v.label),
        el('div', { display: 'flex', fontSize: 26, fontWeight: 400, marginLeft: 22, opacity: 0.85 }, v.sub),
      ]),
    ]),
    app && app.economics
      ? el('div', { display: 'flex', marginTop: 44, columnGap: 24 }, [
          stat('net saving', `${money(saving)}/mo`, saving != null && saving > 0 ? C.yes : C.no),
          stat('break-even', be != null ? `${be.toFixed(1)} mo` : 'never', be != null ? C.text : C.no),
          stat('markup index', mi != null ? `${mi.toFixed(1)}×` : '—', C.accent),
        ])
      : el('div', { display: 'flex', marginTop: 44, fontSize: 28, color: C.dim },
          app
            ? 'No honest math yet — evidence-backed PRs welcome.'
            : 'Verdicts · honest TCO math · break-even dates · tested compose files'),
    el('div', { display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 24, color: C.dim }, [
      el('div', { display: 'flex' }, 'They tell you if you can. We tell you if you should.'),
      el('div', { display: 'flex' }, 'shouldiselfhost.com'),
    ]),
  ]);
}

async function render(name, app) {
  const svg = await satori(card(app), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  writeFileSync(join(outDir, `${name}.png`), png);
}

const apps = readdirSync(join(root, 'data/apps'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(root, 'data/apps', f), 'utf8')));

await render('default', null);
for (const app of apps) await render(app.id, app);
console.log(`og: ${apps.length + 1} cards generated`);
