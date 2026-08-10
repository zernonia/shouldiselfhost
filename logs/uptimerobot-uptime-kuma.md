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
