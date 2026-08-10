# shouldiselfhost.com

> They tell you if you *can*. We tell you if you *should*.

**The decision layer for self-hosting.** One question per paid SaaS: *should I self-host a
replacement — is it worth my money and my weekends?*

It's not a directory, it's a scoreboard:

- **Verdicts** — YES ("Worth it") / KINDA ("Worth it if…") / NOT REALLY ("Keep paying").
  Yes, we publish honest NOs on apps that *are* self-hostable. Capable ≠ worth your weekends.
- **The math** — real total cost of ownership: VPS share + storage + your maintenance hours at a
  stated rate, against the subscription price, with a **break-even date**. We never hide the
  time cost.
- **Machine-verified installs** — every verdict ships a tested `docker-compose.yml` and a timed
  setup log. CI boots every compose file and checks a health endpoint; broken install claims
  cannot merge.
- **The scoreboard** — "Subscription money escaped: $X/mo" (Σ app price × votes, calculation
  shown as code), the Escape Board (most-replaced SaaS), and the Markup Index (subscription
  price ÷ real self-host cost).

## The ecosystem

We're the third leg of a stool:

| Site | Question |
|---|---|
| [canivibecodeit.com](https://canivibecodeit.com) | can AI rebuild it? |
| [caniselfhostit.com](https://caniselfhostit.com) | can you run it, and how? |
| **shouldiselfhost.com** | **is it worth it?** |

We link their install guides for the *how*; they can't tell you *whether*. That's us.

## How verdicts work

Verdicts are computed against a [published rubric](CONTRIBUTING.md#the-rubric) — capability,
economics, effort ceiling, project health — under a fixed test protocol (fresh Debian, 2 GB
reference environment, AI assistant allowed and stated, setup timed). Votes never change
verdicts. Sponsors can't touch verdicts. See [/methodology](https://shouldiselfhost.com/methodology).

Disagree with a verdict? [Open a dispute](.github/ISSUE_TEMPLATE/verdict-dispute.yml) with
evidence against the rubric — that's the point of publishing it.

## Repo layout

```
data/apps/*.json          # one per SaaS target (human-edited) — verdicts, economics, jobs
data/alternatives/*.json  # one per OSS tool (human-edited), referenced by id
data/metrics/*.json       # BOT-WRITTEN ONLY — stars, last commit, releases (nightly)
compose/*.yml             # tested compose files (CI boots these)
logs/*.md                 # timed setup evidence
app/                      # Nuxt 4 site (prerendered on Cloudflare)
```

Git is the CMS. Inputs are stored, outputs are derived — savings, break-even, Markup Index and
abandonment flags are computed at build from raw fields, never hand-written.

## Data & licensing

- **Site code:** [AGPL-3.0](LICENSE).
- **Decision-layer data** (verdicts, economics, timings, votes — everything under `data/` we
  authored): [CC BY-SA 4.0](data/LICENSE) — share-alike **with attribution**. Forks must credit
  and stay open.
- **Capability seed:** app → replacement pairs seeded from
  [caniselfhostit](https://github.com/caniselfhostit/caniselfhostit) (MIT, © Jashanpreet Singh)
  — marked with `provenance.capability_seed` per record and credited on every page that uses it.
- Open data, day 1: [`/api/apps.json`](https://shouldiselfhost.com/api/apps.json) ·
  [`/llms.txt`](https://shouldiselfhost.com/llms.txt) · [RSS of verdict changes](https://shouldiselfhost.com/rss.xml).

## Contributing

The whole site runs on PRs — a verdict is a compose file, a timed log, and economics JSON that
CI can verify. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Found an app that's
NOT SCORED YET? That page is waiting for your PR.

## Dev

```bash
npm install
npm run validate   # JSON Schema + referential + derived-field checks on data/
npm run dev        # Nuxt dev server
npm run build      # prerenders every page from data/
```
