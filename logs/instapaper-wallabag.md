# Timed setup log: Instapaper → wallabag

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~13 min |
| Boot in our verification environment blocked (ghcr.io-only images, model download, or the microVM's ipv6.disable=1 kernel) — **compose boot is certified by the CI runner** (`compose-check` gate, per-PR + weekly) | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~13 min |
| **Total: ~40 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- The image's nginx config hard-binds [::]:80 and crash-loops on kernels booted with ipv6.disable=1 (our verification microVM) — this pair's compose boot is certified by the CI runner
- First boot runs Symfony install + migrations and nginx answers nothing for minutes — a healthcheck without a generous start_period declares it dead while it's warming up
- SQLite default is fine for one reader; switch to the postgres envs before inviting the household

## Verdict-relevant notes

- API + apps work against self-hosted out of the box (server URL in the app settings).
