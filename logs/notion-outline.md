# Timed setup log: Notion → Outline

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code (allowed & stated — protocol v1 assumes an AI sysadmin)
**Environment:** containerized runner, 2 vCPU class, Debian-based, Docker 29.3 / Compose v5.1 preinstalled

> This is THE worked example — the template every contributor copies. Format: environment,
> timeline, measurements, what broke. Honest numbers or nothing.

## Timeline (wall clock)

| Step | Time |
|---|---|
| Read Outline's docker docs, draft compose (postgres + redis + outline + mail catcher) | 22 min |
| Generate secrets (`openssl rand -hex 32` × 2), first `docker compose up` | 4 min |
| **Boot #1 failed** — mail catcher crash-looping (see What broke) | 12 min to diagnose |
| Swap maildev → mailpit, re-up | 3 min |
| **Boot #2: all 4 services healthy in 44 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: magic-link sign-in via mailpit UI, create doc, edit, search finds it | 18 min |
| Cleanup, re-run from scratch to confirm reproducibility | 15 min |
| **Total: ~75 min** | |

## Measurements

- `docker compose up --wait` → healthy: **44 s** (clean volumes, images cached)
- Containers: 4 (outline, postgres:16, redis:7, mailpit)
- Idle RAM after sign-in: outline ~480 MB + postgres ~40 MB + redis ~5 MB — 2 GB box is comfortable, 1 GB is not with anything else running

## What broke

1. **maildev crashes where IPv6 is disabled** (`listen EAFNOSUPPORT: address family not
   supported :::1025`). Many CI runners and some VPS images disable IPv6; maildev insists on
   binding `::`. Swapped to **mailpit**, which binds IPv4 fine and has a `readyz` probe.
2. **Outline without SMTP is a locked door**: it boots healthy but magic-link sign-in silently
   goes nowhere until SMTP_* points somewhere real. The compose ships mailpit so the workflow
   is completable locally; in production use a real mailbox or OIDC.

## Verdict-relevant notes

- The docs/wiki/search/collab jobs all work. There is no databases feature — Notion's
  views/relations/rollups have no equivalent here. That gap, not the setup, drives the KINDA.
- Notion import exists (Markdown/HTML export → import) but attachments need re-linking.
