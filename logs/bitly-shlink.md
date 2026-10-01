# Timed setup log: Bitly → Shlink

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (single container, SQLite backend, healthcheck on `/rest/health`) | 8 min |
| **Boot: healthy in 20 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: generate API key, create short link via REST API, follow redirect, read visit stats | 20 min |
| Re-run from clean volumes | 6 min |
| **Total: ~35 min** | |

## Measurements

- Boot to healthy: **20 s** · 1 container (SQLite — no DB container needed at personal scale)
- Idle RAM ~90 MB — Raspberry Pi territory

## What broke

1. **`DEFAULT_DOMAIN` is a commitment.** Set it before creating links; short URLs embed it,
   so changing domains later means the old links are someone else's problem (yours).

## Verdict-relevant notes

- Short links, analytics, QR codes, API: the whole Core-plan job list is covered.
- The honest tradeoff is the redirect server's uptime — every link you ever shared depends on
  it. Put it on your most boring, most stable box.

---

## Re-verification — 2026-10-01

**Verified by:** tier3-bot · **Assistant:** claude-code · **Protocol:** v1
**Environment:** containerized runner, 2 vCPU class, Docker 25.x / Compose v2.38.2

| Step | Result |
|---|---|
| `bash scripts/check-compose.sh compose/bitly-shlink.yml` | **✓ healthy in 14 s** (was 20 s on original run; shlinkio/shlink:stable = v5.1.7) |
| Health metrics: last commit 2026-09-21 (10 d ago), latest release v5.1.7 | ✓ active, ≤365 d |
| Rubric re-check | YES unchanged |

**What broke:** Nothing new. DEFAULT_DOMAIN commitment still applies (same as original run).

**Verdict:** YES — unchanged. All four Bitly Core jobs covered. Break-even ~1.6 months at $20/hr reference rate.
