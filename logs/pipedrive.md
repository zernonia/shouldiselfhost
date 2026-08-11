# Pipedrive — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/pipedrive-espocrm.yml`
- Boot: **CI-gated** — not verified on this box; the weekly compose-check workflow is the gate
- Setup time recorded: 45 min (boot + configuration to first working workflow)

## What broke / notes

- First-run installer rebuilds the app inside the container and blew straight through a 15-minute health window on the 2GB reference box — budget real time for the first boot, or pre-warm the volume
- Not boot-verified in this session — compose is CI-gated (weekly compose-check must pass before this claim hardens)

## The call

EspoCRM covers pipelines, contacts, activities and email-in for the cost of a MariaDB. It's dated-looking and endlessly capable — which is also a fair description of most CRMs people actually pay for.
