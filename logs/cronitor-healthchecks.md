# Timed setup log: Cronitor → healthchecks

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~11 min |
| **Boot: all services healthy in 12 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~11 min |
| **Total: ~35 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- The image's built-in healthcheck probes the database connection, and the sqlite default has no writable path in the stock container — it 500s forever until you either mount the sqlite dir correctly or (better) give it the Postgres it actually wants

## Verdict-relevant notes

- Same cheap-SaaS pattern as Pinboard: capability is all there; the economics simply never arrive. Run it if you already have a fleet and want internal-only pings.
