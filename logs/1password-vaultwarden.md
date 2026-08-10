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
