# Amplitude — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence (shared)

- This verdict rides on the same replacement verified for `matomo-cloud-matomo` — see `compose/matomo-cloud-matomo.yml` and its log.

## The call

For product analytics at Amplitude's $49+/mo entry point, Matomo (or Countly) covers events, funnels and retention for a VPS share. You lose the fancy cohort AI; you keep the raw events forever without a sampling asterisk.
