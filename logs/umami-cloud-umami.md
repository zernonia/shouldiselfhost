# Timed setup log: Umami Cloud → umami

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

- Image is ghcr.io-hosted — Docker-Hub-only mirrors (ours, during verification) can't pull it; this pair's compose boot is verified by the CI runner

## Verdict-relevant notes

- Default login admin/umami — change it before the container meets the internet.
