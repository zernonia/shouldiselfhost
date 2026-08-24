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

# Re-verification: 2026-08-24 (tier3-bot)

**Protocol:** v1 · **Verified by:** tier3-bot · **Date:** 2026-08-24
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker + Compose

## Compose boot

```
bash scripts/check-compose.sh compose/1password-vaultwarden.yml
✓ compose/1password-vaultwarden.yml healthy in 64s
```

Image pulled: `vaultwarden/server:latest` (= 1.37.2, released 2026-08-22).
Boot to healthy: **64s** cold (image pull dominates; prior run was 72s cold — comparable).

## Health check (data/metrics/vaultwarden.json, fetched 2026-08-23)

- Last commit: 2026-08-22 — **not abandoned** (2 days ago)
- Latest release: 1.37.2 (2026-08-22) — actively maintained
- Stars: 65,846 · Docker pulls: 319,899,662 · Open issues: 83

## Rubric re-check

| Input | Value | Pass? |
|---|---|---|
| Capability | All 5 jobs except vendor-side account recovery | ✓ (≥80%) |
| Economics | Self-host cost $7.17/mo vs. $3.99/mo subscription → net saving **−$3.18/mo** | ✗ never |
| Effort | setup_min 55 (human baseline) ≤ 120 min | ✓ |
| Health | Last commit 2 days ago | ✓ |

Economics fail remains the deciding factor. 1Password price unchanged at $3.99/mo (checked 2026-08-05). The `review.conditions` threshold ($7/mo plan price) has not been crossed.

## Verdict

**NOT_REALLY — no change.** Economics never break even at any realistic maintenance estimate. Compose boots clean on vaultwarden 1.37.2.
