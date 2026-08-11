# Airtable — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/airtable-grist.yml`
- Boot to healthy: **33s** measured this session
- Setup time recorded: 26 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 33s on the 2GB reference env

## The call

Grist is the closest thing to a self-hosted Airtable that actually exists: formula columns, linked records, views, API — sqlite-backed, one container. Per-seat pricing dies the day you move.
