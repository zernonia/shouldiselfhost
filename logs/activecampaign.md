# ActiveCampaign — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence (shared)

- This verdict rides on the same replacement verified for `mailchimp-listmonk` — see `compose/mailchimp-listmonk.yml` and its log.

## The call

The email+automation core moves to listmonk (newsletters) or Mautic (drip logic) — but ActiveCampaign is genuinely an automation suite, and Mautic is the ops-heaviest thing in this category. Worth it if your flows are simple; if you live in their journey builder, the migration will hurt.
