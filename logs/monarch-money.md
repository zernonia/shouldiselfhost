# Monarch Money — verdict log

- **Date:** 2026-08-10 (initial) · **Re-verified:** 2026-08-31 (tier3-bot)
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/monarch-money-actual-budget.yml`
- Boot to healthy: **21s** measured 2026-08-10 / **14s** measured 2026-08-31 (image layers cached on repeat runs)
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- 2026-08-10: Boot to healthy measured at 21s on the 2GB reference env (cold pull)
- 2026-08-31 (tier3-bot re-verification): Compose boots healthy in 14s. actual-budget project active: last commit 2026-08-29, latest release v26.8.1 (2026-08-07). No new friction observed. Economics unchanged: net saving $9.69/mo at $20/hr reference rate; break-even in under 1 month. Verdict YES confirmed.

## The call

Actual Budget is the best self-hosted budgeting tool ever made: local-first, envelope budgeting, fast sync server. Bank imports work through SimpleFIN Bridge ($1.50/mo) — still 90% cheaper than Monarch.
