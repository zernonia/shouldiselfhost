# Timed setup log: Dropbox → nextcloud

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~30 min |
| **Boot: all services healthy in 122 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~30 min |
| **Total: ~90 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- First boot takes a minute+ to install before status.php goes green — healthcheck needs the long start_period
- Trusted-domain config bites the moment you access it from a non-localhost hostname

## Verdict-relevant notes

- The per-TB math flips fast: at 2TB+ of family photos the storage line dominates and self-host wins big. The KINDA is doing a lot of honest work here.
