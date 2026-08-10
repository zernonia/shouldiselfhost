# Timed setup log: Zoom → jitsi

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~40 min |
| **Boot: all services healthy in 11 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~40 min |
| **Total: ~120 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Set ENABLE_IPV6=0 on kernels with ipv6.disable=1 or the templated nginx/prosody binds crash
- Four services must agree on XMPP domains and two shared secrets — one typo and jicofo silently fails to conference; the log line 'Added new videobridge' is the registration proof
- jicofo's REST /about/health wouldn't answer 2xx in our env even with a bridge registered — the compose gates it on a process check instead
- No pgrep/shell tooling in the images — healthchecks lean on curl (web/jicofo images) and /proc greps

## Verdict-relevant notes

- Guests-need-nothing is Jitsi's superpower and it's genuinely great for a personal room. The verdict prices replacing Zoom Pro for meetings that must not fail.
