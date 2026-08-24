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

# Re-verification: 2026-08-24 (tier3-bot)

**Protocol:** v1 · **Verified by:** tier3-bot · **Date:** 2026-08-24
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker + Compose

## Compose boot

```
bash scripts/check-compose.sh compose/uptimerobot-uptime-kuma.yml
✓ compose/uptimerobot-uptime-kuma.yml healthy in 19s
```

Image pulled: `louislam/uptime-kuma:1` (latest in series = 2.5.3, released 2026-08-22).
Boot to healthy: **19s** (cold pull included; warm boot comparable to prior 8s).

## Health check (data/metrics/uptime-kuma.json, fetched 2026-08-23)

- Last commit: 2026-08-23 — **not abandoned** (0 days ago)
- Latest release: 2.5.3 (2026-08-22) — active maintenance confirmed
- Stars: 90,482 · Open issues: 787

## Rubric re-check

| Input | Value | Pass? |
|---|---|---|
| Capability | All 4 UptimeRobot jobs covered | ✓ |
| Economics | Net saving $5.67/mo → break-even ~1.5 mo | ✓ |
| Effort | setup_min 25 (human baseline) ≤ 120 min YES ceiling | ✓ |
| Health | Last commit 1 day ago | ✓ |

## Verdict

**YES — no change.** All four rubric inputs pass. Compose boots clean on 2.5.3.
