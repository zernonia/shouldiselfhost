# Matomo Cloud — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/matomo-cloud-matomo.yml`
- Boot to healthy: **39s** measured this session
- Setup time recorded: 31 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 39s on the 2GB reference env

## The call

It is literally the same software. Matomo Cloud charges $26/mo to run the GPL code they publish; the apache image plus MariaDB is a one-evening setup and the data lands in your database instead of theirs.
