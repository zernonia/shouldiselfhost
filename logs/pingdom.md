# Pingdom — verdict log

- **Date:** 2026-08-10 (initial) · **Re-verified:** 2026-09-08
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/pingdom-uptime-kuma.yml`
- Boot to healthy: **19s** measured this session (was 25s at initial verification)
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## Re-verification 2026-09-08 (tier3-bot)

- Compose boot: `scripts/check-compose.sh compose/pingdom-uptime-kuma.yml` → **19s to healthy**
- Alternative health: uptime-kuma 2.5.3 (released 2026-08-22), last commit 2026-09-07, 91k stars — project thriving
- Days since last commit: 1 — well within 365d health threshold
- No compose changes required
- Verdict unchanged: **YES**

## What broke / notes

- Boot to healthy: 19s (improved from 25s). No new friction — compose and workflow unchanged.
- uptime-kuma v2 (image tag `:1` pulls the v2.x line as of this run — no tag drift observed)

## The call

Uptime Kuma boots in seconds, checks HTTP/TCP/DNS/ping, pages you through ntfy or Telegram, and replaces the entire Pingdom bill. Monitoring your uptime from a box you control is the one recursion self-hosting handles fine — put it on a different provider than what it watches.
