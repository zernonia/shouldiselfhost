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
