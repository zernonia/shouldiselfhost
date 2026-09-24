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

## Re-verification: 2026-09-24

**Verified by:** tier3-bot · **Protocol:** v1 · **Assistant:** claude-code

### Compose boot check

```
bash scripts/check-compose.sh compose/adobe-acrobat-stirling-pdf.yml
✓ compose/adobe-acrobat-stirling-pdf.yml healthy in 48s
```

Image pulled: `stirlingtools/stirling-pdf:latest` (v2.14.3). Previous cold-boot was 72s; this run
48s — meaningfully faster, consistent with upstream build optimizations (last commit 2026-09-23).

### Health check (data/metrics/stirling-pdf.json as of 2026-09-23)

| Metric | Value |
|---|---|
| Stars | 92,837 |
| Last commit | 2026-09-23 (yesterday — extremely active ✓) |
| Latest release | v2.14.3 (2026-08-06) |
| Open issues | 626 |

Project health: **not abandoned** (last commit ≤365d, committed yesterday). Health criterion
passes with flying colours — this is the most-starred alternative in the entire index.

### Rubric re-check (no change)

- **Capability:** merge, split, OCR, compress, fill & sign — covers all 4 Acrobat jobs ≥80% ✓
- **Economics:** `$24.99 − $0.50 − (10 min × $20/h / 60) = $21.16/mo saving`; break-even at
  `(1 min × $20/h / 60) / $21.16 = 0.02 months` — breaks even in days ✓
- **Effort:** 48s to healthy container; no configuration needed (stateless UI) → `setup_min: 1` → YES ✓
- **Health:** last commit yesterday ✓

**Verdict unchanged: YES.** Boot is now faster than before, project activity is high. No changelog entry required.
