# Timed setup log: Calendly → calcom

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~50 min |
| **Boot: all services healthy in 195 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~50 min |
| **Total: ~150 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Image is enormous — the pull dominated boot time even on a fast link
- Boots healthy without calendar OAuth configured, but the product doesn't do its job until you register apps with Google/Microsoft — budget the weekend for that, not the compose

## Verdict-relevant notes

- Setup ceiling is why this is KINDA, not YES: >2h to a genuinely working booking flow.
