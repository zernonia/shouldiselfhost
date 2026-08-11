# Vimeo — verdict log

- **Date:** 2026-08-10
- **Verdict:** KINDA — worth it if…
- **Protocol:** v1 (2GB reference env, Docker preinstalled, AI assistant: claude-code)

## Why no compose file

- This verdict is decided by economics/capability, not setup effort — the rubric doesn't require a timed install to conclude the subscription should stay (or that the replacement's cost lives elsewhere, e.g. GPUs, egress, or an installer script).

## The call

PeerTube is excellent software, but video is the one medium where bandwidth math bites back: transcodes eat CPU, storage grows forever, and egress on a popular video can exceed the subscription. Worth it for a modest catalog behind your own domain; not for scale.
