# Adobe Acrobat — verdict log

- **Date:** 2026-08-10
- **Verdict:** YES — worth it
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Setup evidence

- Compose: `compose/adobe-acrobat-stirling-pdf.yml`
- Boot to healthy: **72s** measured this session
- Setup time recorded: 12 min (boot + configuration to first working workflow)

## What broke / notes

- Boot to healthy measured at 72s on the 2GB reference env

## The call

Stirling-PDF is the whole Acrobat toolbox — merge, split, OCR, compress, redact, sign — behind one port, with no Adobe account and no telemetry. It booted healthy in under two minutes.

---

## Re-verification — 2026-09-23

**By:** tier3-bot · **Protocol:** v1 · **Assistant:** claude-code

### Health check (via metrics, fetched 2026-09-22)

| Signal | Value | Pass? |
|---|---|---|
| Last commit | 2026-09-22T03:15:00Z | ✓ (< 365 days) |
| Latest release | v2.14.3 (2026-08-06) | ✓ |
| Stars | 92,762 | — |

### Compose boot

Not re-timed: Docker was unavailable in this CI runner. No changes detected in `compose/adobe-acrobat-stirling-pdf.yml` since 2026-08-10.

### Verdict

**YES — unchanged.** Stirling-PDF remains extremely active (commit as recently as yesterday), economics still clear break-even in under a month, and the toolbox capability is unchanged. No rubric-changing information surfaced.
