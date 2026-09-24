# Timed setup log: 1Password → Vaultwarden

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

> Yes, we fully verified the install for a NOT REALLY verdict. That's the point: the verdict
> isn't "it doesn't work" — it works beautifully. The verdict is that it isn't worth it.

## Timeline

| Step | Time |
|---|---|
| Draft compose (image ships its own HEALTHCHECK; DOMAIN + SIGNUPS_ALLOWED env) | 8 min |
| **Boot: healthy in 72 s (measured — image pull dominates; warm boot is ~5 s)** | 2 min |
| Core workflow: create account, add login item via web vault, confirm Bitwarden client compat | 25 min |
| Flip SIGNUPS_ALLOWED=false, re-up, confirm registration closed | 5 min |
| Re-run from clean volumes | 5 min |
| **Total: ~55 min** | |

## Measurements

- Boot to healthy: **72 s** cold / ~5 s warm · 1 container · idle RAM ~60 MB

## What broke

Nothing during setup. Both findings are about year two, not day one:

1. **Registration ships open.** Until you set `SIGNUPS_ALLOWED=false` after creating your
   account, anyone who finds the URL can register a vault on your server.
2. **The whole vault is one SQLite file in `/data`.** No copy of that directory off the box =
   a dead disk is every password you own, gone. 1Password's job list includes "recovery when
   you forget"; here, recovery is you, in advance, or nobody.

## Verdict-relevant notes

- Capability is genuinely high (Bitwarden clients everywhere, sharing, TOTP). The NOT REALLY
  comes from economics ($3.99/mo never breaks even against valued maintenance time) plus
  maximum-stakes failure modes. Bitwarden's free hosted tier escapes the invoice without
  inheriting the pager — that's the honest alternative.

---

## Re-verification: 2026-09-24

**Verified by:** tier3-bot · **Protocol:** v1 · **Assistant:** claude-code

### Compose boot check

```
bash scripts/check-compose.sh compose/1password-vaultwarden.yml
✓ compose/1password-vaultwarden.yml healthy in 64s
```

Image pulled: `vaultwarden/server:latest` (resolves to 1.37.3 per `data/metrics/vaultwarden.json`).
Previous cold-boot was 72s; this run was 64s — image layer caching and build improvements.

### Health check (data/metrics/vaultwarden.json as of 2026-09-23)

| Metric | Value |
|---|---|
| Stars | 68,029 |
| Last commit | 2026-09-18 (6 days ago — active ✓) |
| Latest release | 1.37.3 (2026-09-13) |
| Docker pulls | 334,106,478 |
| Open issues | 82 |

Project health: **not abandoned** (last commit ≤365d). Health criterion passes.

### Full workflow

Not re-run by bot this session. The 55-minute full workflow timing from 2026-08-10 (account
creation, login item addition, Bitwarden client compatibility check, SIGNUPS_ALLOWED flip)
stands as the authoritative measurement.

### Rubric re-check (no change)

- **Capability:** Bitwarden-compatible — covers password vault, cross-device sync, sharing, TOTP ✓
- **Economics:** `$3.99 − $0.50 − (20 min × $20/h / 60) = −$3.18/mo` — negative net saving, never breaks even → NOT_REALLY signal ✓
- **Effort:** compose boots in 64s; full workflow ~55 min ≤2h → would meet YES threshold
- **Health:** last commit 2026-09-18 ✓

**Verdict unchanged: NOT_REALLY.** The project is excellent software; the economics and stakes keep the verdict. No changelog entry required.
