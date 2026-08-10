# Timed setup log: Slack → Mattermost

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (mattermost + postgres, datasource string, site URL) | 15 min |
| **Boot #1: server up and serving, but never reported healthy** (see What broke) | 15 min to diagnose |
| Switch healthcheck to `mmctl system status --local`, re-up | 3 min |
| Boot #2 to healthy + core workflow: create admin + team, post in a channel, second browser sees it live | 25 min |
| Re-run from clean volumes | 7 min |
| **Total: ~65 min** | |

## Measurements

- 2 containers · Mattermost idle RAM ~450 MB + postgres ~40 MB — wants the full 2 GB box
- Server boots and serves within ~60 s; plugin unpacking continues for a while after

## What broke

1. **The image ships no shell, curl or wget** — a `CMD-SHELL` healthcheck fails with
   "stat /bin/sh: no such file or directory" forever while the server is actually fine.
   Exec-form `mmctl system status --local` (with `MM_SERVICESETTINGS_ENABLELOCALMODE=true`)
   is the healthcheck that works.
2. **First admin is a race**: whoever completes the first-run screen owns the workspace.
   Plan the rollout; don't send the URL to the team before you've clicked through.

## Verdict-relevant notes

- Channels, DMs, search, webhooks: solid. Mobile push routes through Mattermost's relay (or
  you run your own push proxy) — test it before you migrate anyone who matters.
- The KINDA is arithmetic: per-seat pricing versus a flat server cost. At 1 seat you're
  losing money; at 10 seats you're keeping ~$1,000/yr for one weekend plus ops ownership.
