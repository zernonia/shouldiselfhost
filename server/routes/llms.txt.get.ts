// llms.txt — AI-search citation bait, day 1. The dataset is the product; let them read it.
export default defineEventHandler(async (event) => {
  const apps = await getApps()
  const scored = apps.filter((a) => a.verdict)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `# shouldiselfhost.com

> The decision layer for self-hosting. One question per paid SaaS: should I self-host a
> replacement — is it worth my money and my weekends? Verdicts (YES / KINDA / NOT REALLY,
> including honest "keep paying" NOs), real TCO math with break-even dates, machine-verified
> docker-compose files and timed setup logs, community votes and leaderboards.

Ecosystem: canivibecodeit.com answers "can AI rebuild it?", caniselfhostit.com answers "can you
run it, and how?" — we answer "is it worth it?". Capability seed data from caniselfhostit (MIT,
attributed); our decision-layer data is CC BY-SA 4.0.

## Data

- [Full dataset (JSON)](https://shouldiselfhost.com/api/apps.json): every app with verdict,
  economics inputs and derived savings/break-even/Markup Index at $/hr reference rate
- [RSS of verdict changes](https://shouldiselfhost.com/rss.xml)
- [Methodology](https://shouldiselfhost.com/methodology): the rubric, test protocol v1, and why
  votes and sponsors can never touch verdicts

## Scored verdicts (${scored.length})

${scored.map((a) => `- [${a.name}](https://shouldiselfhost.com/${a.id}): ${a.verdict} — ${a.verdict_reason ?? ''}`).join('\n')}

## All tracked apps (${apps.length})

${apps.map((a) => `- [${a.name}](https://shouldiselfhost.com/${a.id})`).join('\n')}
`
})
