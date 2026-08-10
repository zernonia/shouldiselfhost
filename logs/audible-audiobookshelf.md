# Timed setup log: Audible → audiobookshelf

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~10 min |
| **Boot: all services healthy in 5 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~10 min |
| **Total: ~30 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- The image ships wget but not curl — a curl-based healthcheck reports unhealthy forever while the server is fine

## Verdict-relevant notes

- If you already rip/buy DRM-free audiobooks, read this as a personal YES: ABS + its excellent mobile apps beat Audible's player outright.
