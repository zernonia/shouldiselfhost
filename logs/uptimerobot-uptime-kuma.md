# Timed setup log: UptimeRobot → Uptime Kuma

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (one service; image ships its own HEALTHCHECK) | 6 min |
| **Boot: healthy in 8 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: create admin, add HTTP monitor + keyword monitor, watch first checks land | 14 min |
| Re-run from clean volumes | 4 min |
| **Total: ~25 min** | |

## Measurements

- Boot to healthy: **8 s** · 1 container · idle RAM ~150 MB — Raspberry Pi territory

## What broke

Nothing. This is the cleanest install on the site so far.

## Verdict-relevant notes

- Every job on UptimeRobot's paid list (monitor types, status pages, alert channels,
  response-time history) is present.
- The structural caveat is in the verdict: a monitor on your own VPS can't tell you your VPS
  is down. Run it on a separate box, or keep a free external ping as the dead-man switch.

---

## Bot re-verification — 2026-09-14

**Verified by:** tier3-bot · **Protocol:** v1 · **Assistant:** tier3-bot (claude-code)

| Check | Result |
|---|---|
| `bash scripts/check-compose.sh compose/uptimerobot-uptime-kuma.yml` | ✓ healthy in 20 s (cold pull) |
| uptime-kuma last_commit (data/metrics/uptime-kuma.json) | 2026-09-13 — ≤ 365 d ✓ |
| Latest upstream release | 2.5.4 (published 2026-09-11) |
| Compose image tag | `louislam/uptime-kuma:1` (v1 major-pin) — v2 untested, separate PR needed |
| Verdict change | None — YES affirmed |

**Full workflow not re-timed.** Compose health check confirms the image still boots and passes its built-in HEALTHCHECK. The v1/v2 divergence is flagged for a human to assess; rubric inputs are unchanged.
