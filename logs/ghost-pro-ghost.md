# Timed setup log: Ghost(Pro) → ghost

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~16 min |
| **Boot: all services healthy in 22 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~16 min |
| **Total: ~50 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Where IPv6 is disabled Ghost dies with the deeply unhelpful 'Code: -97' — it's EAFNOSUPPORT; set server__host: 0.0.0.0
- MySQL 8's first-boot init answers socket pings while TCP is still down, so a socket-based healthcheck releases Ghost too early into an ECONNREFUSED crash-loop — probe with --protocol=tcp
- Ghost 5 requires MySQL 8 specifically — SQLite and MariaDB are not supported paths

## Verdict-relevant notes

- Memberships + Stripe work self-hosted; bulk newsletter needs a Mailgun key.
