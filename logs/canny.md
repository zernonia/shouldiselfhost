# Canny — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/canny-fider.yml`
- Boot to healthy: **62s** measured this session
- Setup time recorded: 12 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 62s on the 2GB reference env

## The call

Canny wants $99/mo for a feedback board. Fider is a feedback board. It has voting, statuses, comments and SSO, boots with one Postgres, and the entire category is a solved problem.
