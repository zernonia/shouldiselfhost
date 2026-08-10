# shouldiselfhost.com

The **decision layer** for self-hosting. One question per paid SaaS: **"SHOULD I self-host a
replacement — is it worth my money and my weekends?"**

Tagline: "They tell you if you *can*. We tell you if you *should*."
Identity: "It's not a directory, it's a scoreboard."

Ecosystem position (use in all copy): third leg of the stool —
canivibecodeit = "can AI rebuild it?" · caniselfhostit = "can you run it, and how?" ·
**shouldiselfhost = "is it worth it?"** We cross-link both generously; we complete them, we don't
compete with them.

## What NOT to build (caniselfhostit.com already owns this — consume/link it)

- One editorial replacement per app + vendor list price ("The Rack")
- 4-tier setup-effort scale (ONE COMMAND / ONE EVENING / ONE WEEKEND / ONGOING OPS)
- AI-agent install prompts assuming a bare machine ("Prompt Zero") — link theirs, never mirror
- Their identity is "no ads, no affiliate links"; ours is transparent monetization instead

What they do NOT have — our entire product: verdicts (including honest "keep paying" NOs), TCO
math and break-even dates, community votes/leaderboards/stacks, the ticking counter, freshness &
abandonment metrics, ranked alternative lists, /vs pages.

## Verdict system (LOCKED)

Labels: **YES / KINDA / NOT REALLY** with subtitles "Worth it / Worth it if… / Keep paying".
Computed from four inputs against the published rubric:

- **Capability:** replacement covers ≥80% of the app's listed "jobs"
- **Economics:** break-even within a reasonable window at a stated hourly rate (net of VPS share,
  storage, and valued maintenance hours)
- **Effort ceiling:** YES requires core workflow running ≤2h on the reference environment;
  KINDA ≤ one weekend
- **Project health:** primary alternative not abandoned (last commit ≤365d)

Key differentiator: we can rule NOT REALLY on things that ARE self-hostable — "capable but not
worth your weekends." Honest NOs are a trust feature, not a bug.

## Architecture (LOCKED)

- Nuxt 4 on Cloudflare (nitro cloudflare preset). `routeRules: { '/**': { prerender: true } }` —
  all content pages static; `/api/**` on the Worker; votes hydrate as small client islands.
- Dynamic plane is tiny: votes → D1; homepage counter → cached SUM; everything else static.
- Git is the CMS:
  - `data/apps/*.json` — one per SaaS target (human-edited)
  - `data/alternatives/*.json` — one per OSS tool, referenced by id (human-edited)
  - `data/metrics/*.json` — **BOT-WRITTEN ONLY, humans never touch**
  - `compose/*.yml` — tested compose files (CI-verified)
  - `logs/*.md` — timed setup evidence

### Golden rule: store inputs, derive outputs

Never hand-write a derived number. Store `price_usd_mo`, `economics.vps_share_usd_mo`,
`verified.setup_min`, `economics.maint_min_mo`; the build computes savings, break-even, Markup
Index, and abandonment flags (`scripts/lib/derive.mjs` is the single source of truth). One field
changes → every page, leaderboard, and OG image recalculates.

### Provenance

Every app record carries `provenance`: `capability_seed` distinguishes MIT-imported capability
data (from caniselfhostit, attributed in the footer and per page) from our original decision
layer (verdicts, economics, timings, votes), which is CC BY-SA 4.0. Keep the layers separable.

## Verdict integrity (LOCKED — the moat AND the liability)

1. Rubric is published in CONTRIBUTING.md; verdicts are arguable against criteria, not taste.
2. Test protocol v1: fresh Debian, Docker preinstalled, 2GB reference env, AI assistant allowed
   and stated, setup timed. "47 min" is a measurement, not an estimate.
3. Evidence required, CI-enforced: compose + timed log + "what broke". CI runs
   `docker compose up` and checks a health endpoint — broken compose cannot merge.
4. Votes never change verdicts (display-only). Disputes → issue template requiring evidence.
5. Every verdict: `verified.by`, `verified.at`, evidence links, visible changelog
   (`data/changelog.json` feeds RSS).
6. Sponsors can't touch verdicts; affiliate links only below the math, never affecting rankings.
7. Claude proposes, humans merge. Automation opens PRs only; bots write only to `data/metrics/`.

## Automation rules (LOCKED)

- Tier 1 (nightly, $0): stars / last commit / releases / Docker pulls → writes `data/metrics/` only.
- Tier 2 (nightly, Haiku 4.5, Batch): release triage + price-diff summaries.
- Tier 3 (nightly, Claude Code, 1–2 apps): full re-verification, opens PRs.
- **Never both `CLAUDE_CODE_OAUTH_TOKEN` and `ANTHROPIC_API_KEY` in one workflow.** Always
  `--max-turns`, pinned model, PRs only.

## Dev

- `npm run validate` — JSON Schema + referential + derived-fields checks on `data/`
- `npm run import:seed` — re-import capability layer from a caniselfhostit checkout (idempotent;
  never overwrites our decision-layer fields)
- `npm run dev` / `npm run build` — Nuxt; all content prerenders at build from `data/`
