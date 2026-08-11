# Zendesk — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/zendesk-chatwoot.yml`
- Boot to healthy: **91s** measured this session
- Setup time recorded: 42 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 91s on the 2GB reference env

## The call

Chatwoot gives you shared inboxes, live chat widgets, canned responses and automations — the Zendesk core — per agent forever, for the price of a mid VPS. The rails stack is heavier than most on this list; it's still a weekend, not a career.
