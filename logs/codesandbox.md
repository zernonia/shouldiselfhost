# CodeSandbox — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/codesandbox-code-server.yml`
- Boot to healthy: **25s** measured this session
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 25s on the 2GB reference env

## The call

code-server puts real VS Code on your VPS and it boots instantly. What it doesn't do is CodeSandbox's instant throwaway environments and live collab. Worth it as your persistent cloud IDE; not a sandbox factory.
