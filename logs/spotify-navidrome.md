# Timed setup log: Spotify → Navidrome

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (one container + a music folder mount) | 6 min |
| **Boot: healthy in 16 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: create admin, point at a test library, scan, stream a track in the browser | 15 min |
| Re-run from clean volumes | 5 min |
| **Total: ~30 min** | |

## Measurements

- Boot to healthy: **16 s** · 1 container · idle RAM ~80 MB — Raspberry Pi territory

## What broke

Nothing. Navidrome is a model citizen: one container, one config mount, a `/ping` endpoint,
ARM builds, instant scan on a small library.

## Verdict-relevant notes

- This is the clearest case on the site of **setup ≠ verdict**. The install passes every
  effort test; the economics even pass the rubric. What it cannot do is contain music you
  don't own — and "a ~100M-track catalog you don't own" is the first job on Spotify's list.
- If you already have a real library (rips, Bandcamp), read this page as a personal YES:
  Navidrome + any Subsonic client is genuinely better than Spotify for owned music.
