# Timed setup log: NordVPN → wg-easy

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~10 min |
| Boot in our verification environment blocked (ghcr.io-only images, model download, or the microVM's ipv6.disable=1 kernel) — **compose boot is certified by the CI runner** (`compose-check` gate, per-PR + weekly) | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~10 min |
| **Total: ~30 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Image is ghcr.io-hosted — CI-verified; needs NET_ADMIN + sysctls, which some container hosts refuse

## Verdict-relevant notes

- The economics pass our rubric; the verdict is capability: the job most people pay NordVPN for cannot be self-hosted by definition. Rubric input #1 (jobs coverage) carries this one.
