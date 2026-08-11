# Grammarly — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/grammarly-languagetool.yml`
- Boot to healthy: **20s** measured this session
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 20s on the 2GB reference env

## The call

LanguageTool's server boots in seconds and the browser extension points at it with one setting — grammar and style rules without shipping every keystroke to a cloud. But Grammarly's AI rewrites are genuinely a tier above. Worth it if privacy is the point; not if the AI editor is.
