# Timed setup log: Backblaze Personal Backup → Backrest

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Draft compose (one container; data/config/cache mounts) | 8 min |
| **Boot: healthy in 16 s (measured, `compose up --wait`)** | 1 min |
| Core workflow: create a local restic repo via the UI, back up a test directory, restore a file | 25 min |
| Re-run from clean volumes | 5 min |
| **Total: ~45 min** | |

## Measurements

- Boot to healthy: **16 s** · 1 container · idle RAM ~50 MB

## What broke

Nothing in the software. The break is conceptual, and it's the verdict:

1. **A restic repo on local disk is a copy, not a backup.** The moment you add the offsite
   leg — B2/S3 at roughly $6/TB/mo — you're renting storage again, from the same kind of
   company you were escaping, plus you now own the restore drill.

## Verdict-relevant notes

- Backrest is excellent for backing up **your self-hosted stack** — we'd put it in our own
  reference VPS without hesitation. The NOT REALLY is specifically about replacing the
  unattended, unlimited, last-resort backup of your personal machines.
