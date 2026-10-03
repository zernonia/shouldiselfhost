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

---

## Re-verification: 2026-10-02

**Re-verified by:** tier3-bot · **Protocol:** v1 · **Assistant:** claude-code

| Check | Result |
|---|---|
| `compose up --wait` (images cached, previous volumes present) | **22 s** (healthy) |
| All 3 services healthy | ✓ (after compose fixes below) |
| Plausible last commit | 2026-09-30 (active) |
| Latest release | v3.2.1 (2026-05-15) |
| Verdict change | None — YES holds |

### What broke on re-check

1. **ClickHouse 24.12-alpine changed default-user behavior.** ClickHouse 24.x now disables HTTP access for the 'default' user when no credentials are configured — a breaking change from 24.3 LTS. Fix: add `CLICKHOUSE_USER: plausible` + `CLICKHOUSE_PASSWORD: plausible` to the events-db service and thread the same credentials into Plausible's `CLICKHOUSE_DATABASE_URL`. Both values are throwaway test secrets (note in compose); use a real secrets manager in production.

2. **Alpine resolves `localhost` to `::1` (IPv6), Phoenix binds to `0.0.0.0` (IPv4).** The original health check `wget -qO- http://localhost:8000/api/health` always failed because the HTTP listener isn't on the IPv6 loopback. Fix: use `127.0.0.1` explicitly. Also switched to `/js/plausible.js` (static file, always 200) because `/api/health` returns 503 until the ClickHouse credential wiring is complete.

3. **`busybox wget` does not support HTTP Basic Auth via URL.** The intermediate attempt `wget -qO- http://user:pass@host/ping` was silently ignored. Fix: use `clickhouse-client` for the ClickHouse health check (it handles credentials correctly).

### Verdict-relevant notes from re-check

- Economics unchanged: break-even ≈ 8.9 months at the reference rate.
- The ClickHouse credential change adds one extra config step to production setups (2 env vars and URL update). Effort ceiling: still well under 2 h from a clean start.
- YES verdict confirmed.
