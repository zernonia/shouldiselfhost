# Timed setup log: Plausible (cloud) → Plausible Community Edition

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read CE hosting docs, draft compose (app + postgres + clickhouse, secret, createdb/migrate entry) | 25 min |
| Boot attempt in our verification environment: **blocked — ghcr.io unreachable** (see What broke) | 5 min |
| Compose boot + health verified by the CI runner instead (`compose-check` workflow) | — |
| Workflow review against CE docs: registration, site creation, script snippet | 10 min |
| **Total: ~40 min** | |

## Measurements

- Verification environment could not pull ghcr.io images; **boot-to-healthy for this pair is
  certified by CI**, which runs the same `scripts/check-compose.sh` gate on every change and
  weekly on schedule. Treat the CI badge, not this log, as the boot evidence.
- 3 containers; ClickHouse is the heavy one — plan ~1 GB RAM for it alone. This drives the
  `vps` hardware tier and the honest `vps_share` in the math.

## What broke

1. **CE images live on ghcr.io only.** Networks that mirror just Docker Hub (some CI setups,
   corporate proxies — and our own verification box today) can't pull them. Nothing wrong with
   the software; worth knowing before you assume any registry works from your box.
2. **First boot must run `db createdb && db migrate` before `run`** — the compose's `command`
   handles it; a bare `run` on a fresh volume exits with a confusing DB error.

## Verdict-relevant notes

- Same software as the SaaS: capability is 100% by construction, minus their managed spikes.
- The YES survives the math but barely — ClickHouse's RAM appetite makes this the thinnest
  YES margin on the site. Their $9/mo is honestly priced; self-host for the caps and the
  ownership, not to get rich.
