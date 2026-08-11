# Vercel — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Why no compose file

- This verdict is decided by economics/capability, not setup effort — the rubric doesn't require a timed install to conclude the subscription should stay (or that the replacement's cost lives elsewhere, e.g. GPUs, egress, or an installer script).

## The call

Coolify (or Dokploy) turns any VPS into your own deploy platform: git-push previews, SSL, one dashboard. Vercel's free tier is generous though — this only pays once you're buying seats or bandwidth. Note: it installs via script, not a single compose file, so our weekly CI covers it differently.
