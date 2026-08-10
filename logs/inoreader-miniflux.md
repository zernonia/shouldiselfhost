# Timed setup log: Inoreader → miniflux

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~11 min |
| **Boot: all services healthy in 24 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~11 min |
| **Total: ~35 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- CREATE_ADMIN only fires on first boot; set the env before, not after, or exec the CLI

## Verdict-relevant notes

- Built-in healthcheck binary (`miniflux -healthcheck`) makes the compose gate trivial.
