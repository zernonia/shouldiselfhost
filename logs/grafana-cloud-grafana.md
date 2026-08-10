# Timed setup log: Grafana Cloud → grafana

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~15 min |
| **Boot: all services healthy in 73 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~15 min |
| **Total: ~45 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Nothing for Grafana itself — the real setup time is in the data sources it points at

## Verdict-relevant notes

- Verdict scope: replacing Grafana Cloud Pro for a small stack that already has (or can run) its own Prometheus. If you want managed everything, that's the product you're paying for.
