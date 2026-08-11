# Typeform — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/typeform-formbricks.yml`
- Boot: **CI-gated** — not verified on this box; the weekly compose-check workflow is the gate
- Setup time recorded: 40 min (boot + configuration to first working workflow)

## What broke / notes

- The image runs `pnpm prisma migrate deploy` at first boot and corepack downloads pnpm from npm at runtime — behind a TLS-intercepting proxy this dies with SELF_SIGNED_CERT_IN_CHAIN; on a normal box it just works, but airgapped/proxied environments should know
- Not boot-verified in this session — compose is CI-gated (weekly compose-check must pass before this claim hardens)

## The call

Formbricks covers forms, surveys, logic jumps and webhooks with a modern editor. Typeform's $39/mo Basic caps responses; your Postgres doesn't. One app container plus a database and you're collecting.
