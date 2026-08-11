# Baserow — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/baserow-cloud-baserow.yml`
- Boot to healthy: **91s** measured this session
- Setup time recorded: 27 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 91s on the 2GB reference env

## The call

The cloud plan charges $12/user for the open-source software's hosted convenience. Baserow's all-in-one image (embedded Postgres and Redis) took the longest first boot of this batch but runs itself afterwards.
