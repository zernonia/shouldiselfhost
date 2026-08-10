# Timed setup log: Squarespace → wordpress

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~20 min |
| **Boot: all services healthy in 50 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~20 min |
| **Total: ~60 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Nothing at boot — WordPress's risks arrive later, one plugin at a time

## Verdict-relevant notes

- MariaDB's healthcheck.sh script makes the DB gate clean.
