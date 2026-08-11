# Uptime.com — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/uptime-gatus.yml`
- Boot to healthy: **14s** measured this session
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 14s on the 2GB reference env

## The call

Same story as Pingdom, smaller bill: Uptime Kuma covers the checks and the status page in one quick setup (Gatus if you want config-as-code — we verified both). At $7/mo the math is thinner but the effort is so close to zero it still clears the bar.
