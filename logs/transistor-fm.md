# Transistor — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/transistor-castopod.yml`
- Boot: **CI-gated** — not verified on this box; the weekly compose-check workflow is the gate
- Setup time recorded: 45 min (boot + configuration to first working workflow)

## What broke / notes

- The redis cache handler refuses to start without CP_REDIS_PASSWORD — undocumented in most guides; file cache removes a whole container
- Even with cache fixed and ports corrected, the container never reported healthy on the 2GB reference env inside 7 minutes — the claim stays CI-gated until a clean boot is proven
- Not boot-verified in this session — compose is CI-gated (weekly compose-check must pass before this claim hardens)

## The call

Castopod hosts your podcast with analytics, an RSS feed you own, and fediverse comments — and audio bandwidth is modest, so the economics work. It sits at KINDA because Castopod would not boot to healthy on our reference box (port and cache-config maze); until the weekly CI proves a clean install, we won't claim the ≤2h a YES requires.
