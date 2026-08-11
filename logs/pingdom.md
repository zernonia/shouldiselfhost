# Pingdom — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/pingdom-uptime-kuma.yml`
- Boot to healthy: **25s** measured this session
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 25s on the 2GB reference env

## The call

Uptime Kuma boots in seconds, checks HTTP/TCP/DNS/ping, pages you through ntfy or Telegram, and replaces the entire Pingdom bill. Monitoring your uptime from a box you control is the one recursion self-hosting handles fine — put it on a different provider than what it watches.
