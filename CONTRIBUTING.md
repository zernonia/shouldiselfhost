# Contributing

Every page on shouldiselfhost.com is generated from JSON in `data/` plus evidence in `compose/`
and `logs/`. A contribution is a PR that CI can verify. Humans merge; bots (and Claude) only
propose.

## The rubric

A verdict answers **"should I self-host a replacement for this SaaS?"** and must be one of:

| Label | Subtitle | Meaning |
|---|---|---|
| `YES` | Worth it | Do it this weekend |
| `KINDA` | Worth it if… | Worth it under stated conditions (listed in `verdict_reason`) |
| `NOT_REALLY` | Keep paying | Capable maybe, but not worth your money + weekends |

A verdict is computed from four inputs, all of which must be present in the record:

1. **Capability** — the primary alternative covers **≥80% of the app's listed `jobs`**. Jobs are
   the things people actually pay for, listed per app. If it can't do the jobs, nothing else
   matters.
2. **Economics** — break-even within **18 months** at the site's stated reference rate
   (see `data/site.json: hourly_rate_usd`), computed as:
   `net_monthly_saving = price_usd_mo − vps_share_usd_mo − storage_usd_mo − (maint_min_mo / 60 × hourly_rate)`
   `break_even_months = one_time_setup_cost / net_monthly_saving` where
   `one_time_setup_cost = setup_min / 60 × hourly_rate`. Negative net saving = no break-even,
   ever — that's a strong NOT_REALLY signal. **Never hand-write derived numbers**; store the
   inputs, the build derives the rest (`scripts/lib/derive.mjs`).
3. **Effort ceiling** — `YES` requires the core workflow running in **≤2 hours** on the
   reference environment (measured `setup_min`, not estimated). `KINDA` allows up to **one
   weekend** (16 h). Beyond that: `NOT_REALLY`, no matter how good the software is.
4. **Project health** — the primary alternative's last commit is **≤365 days** old (checked
   nightly into `data/metrics/`). An abandoned primary caps the verdict at `KINDA`.

The rubric makes verdicts **arguable against criteria, not taste**. Votes never change verdicts.

## Test protocol v1

Install claims are measurements, not estimates. To verify an app:

- **Reference environment:** fresh Debian 12, Docker + Compose preinstalled, 2 GB RAM / 2 vCPU
  (a $5-class VPS, or the CI runner profile in `.github/workflows/compose-check.yml`).
- **AI assistant allowed and stated.** Protocol v1 assumes Claude Code (or equivalent) as your
  sysadmin — that's how people actually self-host in 2026. Note the assistant used in the log.
- **Timed**, wall clock, from empty directory to the core workflow working (not just the
  container healthy — the *workflow*: e.g. "created a doc, edited it from a second browser").
- Record **what broke** — friction is data. A clean run says so explicitly.

## Anatomy of a verdict PR

```
data/apps/<saas>.json           # jobs, price (+source/date), verdict, economics, verified block
data/alternatives/<oss>.json    # one file per OSS tool referenced (if new)
compose/<saas>-<oss>.yml        # the exact compose you booted, with a healthcheck
logs/<saas>-<oss>.md            # timed log: environment, steps, timings, what broke
```

Schemas live in `schemas/` and CI enforces them. CI also **boots your compose file and polls
its health endpoint** — a broken compose cannot merge. See an existing pair for the pattern
(worked example: `data/apps/notion.json` + `compose/notion-outline.yml` + `logs/notion-outline.md`).

Rules:

- Prices need `price_source` + `price_checked`. Use the monthly-billed figure; annual-only gets
  the monthly equivalent with a note.
- `data/metrics/` is bot-written only. Don't touch it in a PR; CI will reject it.
- Every verdict change needs an entry in `data/changelog.json` (feeds the RSS feed) with the old
  and new verdict and a one-line reason.
- Provenance: if capability data (jobs, alternative pairing) came from caniselfhostit's MIT
  dataset, keep `provenance.capability_seed: "caniselfhostit"`. Decision-layer fields (verdict,
  economics, verified) are always ours and land under CC BY-SA 4.0.
- Personality is welcome in `verdict_reason` and `what_you_lose`; numbers are not a place for
  personality.

## Disputes

Open a [verdict dispute](.github/ISSUE_TEMPLATE/verdict-dispute.yml) citing the rubric input you
think is wrong, with evidence (a timed log, a price source, a capability gap). "I like it" and
"I hate it" are votes, not disputes — the vote button is on the page.

## Licensing of contributions

By contributing you agree that code lands under AGPL-3.0 and data under CC BY-SA 4.0
(attribution + share-alike). You keep your credit: verdicts carry `verified.by` forever.
