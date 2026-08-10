# Timed setup log: Pinboard → linkding

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~8 min |
| Boot in our verification environment blocked (ghcr.io-only images, model download, or the microVM's ipv6.disable=1 kernel) — **compose boot is certified by the CI runner** (`compose-check` gate, per-PR + weekly) | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~8 min |
| **Total: ~25 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- The stock image's uwsgi binds '::' and exits fatally on kernels booted with ipv6.disable=1 — our verification microVM is one, so this pair's compose boot is certified by the CI runner instead
- Superuser env vars on first boot and you're in

## Verdict-relevant notes

- This is the cheap-SaaS pattern: when the subscription costs less than valuing your own minutes, the honest answer is keep paying. Run linkding because you want ownership, not savings.
