# Timed setup log: Todoist → vikunja

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read upstream docs, draft compose with healthcheck | ~11 min |
| **Boot: all services healthy in 11 s (measured, `compose up --wait`)** | — |
| Endpoint-level workflow check (login/health/API serve) + re-run from clean volumes | ~11 min |
| **Total: ~35 min** | |

Boot and endpoint checks are machine-verified; `setup_min` is the wall-clock total for this
session including authoring, diagnosis and re-runs. Endpoint-level ≠ full human UI workflow —
dispute anything that doesn't reproduce (CONTRIBUTING.md).

## What broke

- Fresh named volumes initialize root-owned while the image runs as uid 1000 — file handler crash-loops on permission denied until you set user: or chown
- The image is distroless (no shell, no wget) — the compose ships a busybox sidecar probe so the health gate still proves HTTP serves
- Registration ships open by default — create your account, then flip VIKUNJA_SERVICE_ENABLEREGISTRATION off

## Verdict-relevant notes

- /api/v1/info endpoint makes the health gate clean.
