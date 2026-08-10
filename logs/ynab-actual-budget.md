# Timed setup log: YNAB → Actual Budget

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (one container) | 6 min |
| **Boot #1 failed** — container exits cleanly ~2 s after "Listening on :::5006" (see What broke) | 15 min to diagnose |
| Add `ACTUAL_HOSTNAME: 0.0.0.0`, re-up | 2 min |
| **Boot #2: healthy in 6 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: set server password, create budget file, add account + transactions | 12 min |
| Re-run from clean volumes | 4 min |
| **Total: ~40 min** | |

## Measurements

- Boot to healthy: **6 s** · 1 container · idle RAM ~120 MB — Raspberry Pi territory

## What broke

1. **Silent exit where IPv6 is disabled.** The server binds `::` by default; on hosts with
   IPv6 off (CI runners, some hardened VPS images) it logs "Listening on :::5006" and then
   exits with code 0 — no error, no hint. `ACTUAL_HOSTNAME=0.0.0.0` fixes it. This one cost
   real diagnostic time because a clean exit looks like success everywhere except `docker ps`.

## Verdict-relevant notes

- Envelope budgeting, reports, multi-device via the server: covered. Your budget is a SQLite
  file you can copy, which is the whole philosophical pitch.
- Bank sync is the honest asterisk: SimpleFIN Bridge (~$1.50/mo, US/CA) or GoCardless (EU)
  — one more account, and it's the part most likely to need the occasional poke.
