# Timed setup log: ChatGPT → LibreChat

**Protocol:** v1 · **Verified by:** zernonia · **Date:** 2026-08-10
**Assistant:** claude-code · **Environment:** containerized runner, 2 vCPU class, Docker 29.3 / Compose v5.1

## Timeline

| Step | Time |
|---|---|
| Read config docs, draft compose (app + mongo, JWT/CREDS secrets) | 20 min |
| Boot attempt in our verification environment: **blocked — ghcr.io unreachable** (see What broke) | 5 min |
| Compose boot + health verified by the CI runner instead (`compose-check` workflow) | — |
| Workflow review against docs: registration, provider key config, endpoint selection | 15 min |
| **Total: ~50 min** | |

## Measurements

- Verification environment could not pull ghcr.io images; **boot-to-healthy for this pair is
  certified by CI** (same `scripts/check-compose.sh` gate, per-PR and weekly).
- 2 containers (app + mongo); ~700 MB RAM together before any local model enters the picture.

## What broke

1. **ghcr.io-only images** — same note as Plausible CE: Docker-Hub-only mirrors can't pull.
2. **It boots healthy with zero API keys configured** — which is the verdict in one sentence:
   you get a working chat UI with nothing to talk to. Every answer still requires either a
   provider API key (you're paying per-token again) or a local model server plus hardware
   that can feed it.

## Verdict-relevant notes

- For heavy API users with existing keys, LibreChat is genuinely good — multi-provider, clean
  UI, your history in your Mongo. That's the KINDA hiding inside the NOT REALLY.
- For replacing a normal ChatGPT subscription: the model is the product; the UI was never
  what the money bought.

---

## Bot re-verification — 2026-09-20

**By:** tier3-bot · **Protocol:** v1 · **Assistant:** claude-code

| Check | Result |
|---|---|
| `scripts/check-compose.sh compose/chatgpt-librechat.yml` | ✓ healthy in **99 s** (cold pull, 2 containers) |
| librechat last commit | 2026-09-18 — active ✓ |
| librechat latest release | none tagged (rolling main) — project health OK ✓ |
| ghcr.io image pull | Succeeded in this runner environment — previous ghcr.io block lifted |
| Verdict rubric re-run | NOT_REALLY confirmed — capability <80% without API keys; break-even ~50 months at $20/h |

No changes to verdict or economics inputs. First direct compose boot measurement for this pair: 99 s (previously CI-only). ghcr.io pull now succeeds in the standard runner environment.
