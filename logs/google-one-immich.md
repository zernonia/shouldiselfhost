# Timed setup log: Google One → immich

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~20 min |
| Boot in our verification environment blocked (ghcr.io-only images, model download, or the microVM's ipv6.disable=1 kernel) — **compose boot is certified by the CI runner** (`compose-check` gate, per-PR + weekly) | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~20 min |
| **Total: ~60 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Images are ghcr.io-hosted — this pair's compose boot is verified by the CI runner
- Immich requires its own pgvector-patched Postgres image; a vanilla postgres:16 will not do

## Verdict-relevant notes

- At the 2TB tier ($9.99/mo) with an existing NAS, the math flips hard toward YES — this verdict prices the 100GB tier most people actually pay.
