# Timed setup log: Mailchimp → listmonk

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~20 min |
| **Boot: all services healthy in 16 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~20 min |
| **Total: ~60 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- --install must run before first serve (the compose command chains it idempotently)
- Sending anything real requires an SMTP relay — factor ~$1-5/mo for SES into your own math

## Verdict-relevant notes

- Verdict assumes the Essentials list-size tier; large lists change both sides of the equation.
