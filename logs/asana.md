# Asana — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/asana-openproject.yml`
- Boot to healthy: **116s** measured this session
- Setup time recorded: 47 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 116s on the 2GB reference env

## The call

OpenProject is the heavyweight that genuinely covers Asana-and-beyond (Gantt, agile boards, time). Its all-in-one container seeds a full Postgres on first boot — this is a real ops commitment for a team tool your whole team depends on. Worth it for seat counts where the invoice stings.
