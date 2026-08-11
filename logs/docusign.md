# DocuSign — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/docusign-docuseal.yml`
- Boot to healthy: **26s** measured this session
- Setup time recorded: 11 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 26s on the 2GB reference env

## The call

DocuSeal does signatures, templates, audit trails and email flows from one sqlite-backed container. DocuSign's $15/mo Personal plan caps you at 5 sends a month; your own instance doesn't count.
