# Timed setup log: Sentry → glitchtip

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~30 min |
| **Boot: all services healthy in 13 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~30 min |
| **Total: ~90 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- The container serves on 8000, not the 8080 several guides claim — map and probe accordingly
- python-slim image has no curl/wget; the healthcheck probes /_health/ with python urllib
- Celery worker needs its own container with the same env — errors ingest but nothing processes without it; don't healthcheck it with celery inspect ping, which races broker registration forever

## Verdict-relevant notes

- SDK setup is unchanged from Sentry: swap the DSN.
