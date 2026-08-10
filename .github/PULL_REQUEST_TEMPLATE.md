# What kind of PR?

- [ ] New verdict (app + economics + compose + timed log)
- [ ] Verdict change (includes `data/changelog.json` entry)
- [ ] Data fix (price, jobs, alternative metadata)
- [ ] Site/code

## Checklist (verdict PRs)

- [ ] `npm run validate` passes locally
- [ ] Compose file has a healthcheck; I booted it myself under protocol v1
- [ ] Setup was **timed** (wall clock) and the log records environment + what broke
- [ ] Price has `price_source` + `price_checked` (monthly-billed figure)
- [ ] No hand-written derived numbers (savings/break-even are computed at build)
- [ ] Didn't touch `data/metrics/` (bot territory)
- [ ] Verdict change? → `data/changelog.json` entry added

## Summary

<!-- What app, what verdict, one line of why. Quotable beats thorough. -->
