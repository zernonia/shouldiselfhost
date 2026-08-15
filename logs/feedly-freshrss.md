# Timed setup log: Feedly → freshrss

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~10 min |
| **Boot: all services healthy in 7 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~10 min |
| **Total: ~30 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Nothing — image ships with SQLite default and a web installer

## Verdict-relevant notes

- Sync to mobile works via the Google-Reader-compatible API (FreshRSS setting + any client).

---

## Re-verification: 2026-08-15 (tier3-bot, protocol v1)

**Compose check:** `bash scripts/check-compose.sh compose/feedly-freshrss.yml`
**Result:** ✓ healthy in **10s** (includes image pull on a fresh runner)

**Project health (from data/metrics/freshrss.json, fetched 2026-08-14):**
- last_commit: 2026-08-12T19:53:52Z ✅ (within 365 days)
- latest_release: 1.29.1 (2026-05-20) — `freshrss:latest` tag pulls this version

**Rubric verdict:** YES maintained
- Capability ✅ all 4 jobs covered by FreshRSS (feeds, read-state sync via GReader API, search, mobile access)
- Economics ✅ net saving ~$3.16/mo, break-even ~3.2 months
- Effort ✅ setup_min 30 well under 2h
- Project health ✅ last commit 3 days ago

**What broke:** nothing — clean boot, SQLite default, web installer intact.
