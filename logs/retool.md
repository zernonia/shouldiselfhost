# Retool — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/retool-appsmith.yml`
- Boot to healthy: **125s** measured this session
- Setup time recorded: 33 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 125s on the 2GB reference env

## The call

Appsmith's all-in-one container builds the same internal CRUD panels Retool charges per-builder-per-month for. First boot is slow (it's carrying its own Mongo); after that it's an app platform you own.
