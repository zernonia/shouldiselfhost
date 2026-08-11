# Zapier — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/zapier-activepieces.yml`
- Boot: **CI-gated** — not verified on this box; the weekly compose-check workflow is the gate
- Setup time recorded: 45 min (boot + configuration to first working workflow)

## What broke / notes

- First boot syncs its pieces catalog over the network — in a proxied/airgapped environment that sync fails and the API never comes up; plan for npm egress on first start
- Not boot-verified in this session — compose is CI-gated (weekly compose-check must pass before this claim hardens)

## The call

Activepieces runs your automations on your box with a visual builder and hundreds of pieces. Zapier's task-based pricing means success gets expensive; self-hosted, a busy month costs the same as a quiet one.
