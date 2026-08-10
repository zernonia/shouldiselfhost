// RSS of verdict changes — day-1 retention hook; the weekly newsletter grows out of this feed.
const LABEL: Record<string, string> = { YES: 'YES (worth it)', KINDA: 'KINDA (worth it if…)', NOT_REALLY: 'NOT REALLY (keep paying)' }

export default defineEventHandler(async (event) => {
  const [changelog, apps] = await Promise.all([getChangelog(), getApps()])
  const byId = Object.fromEntries(apps.map((a) => [a.id, a]))
  const items = [...changelog].reverse().slice(0, 50).map((c: any) => {
    const name = byId[c.app]?.name ?? c.app
    const title = c.from == null
      ? `${name}: scored ${LABEL[c.to] ?? c.to}`
      : `${name}: ${LABEL[c.from] ?? c.from} → ${LABEL[c.to] ?? c.to}`
    return `    <item>
      <title>${esc(title)}</title>
      <link>https://shouldiselfhost.com/${c.app}</link>
      <guid isPermaLink="false">${c.app}-${c.date}-${c.to}</guid>
      <pubDate>${new Date(c.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description>${esc(c.reason)}</description>
    </item>`
  })
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>shouldiselfhost.com — verdict changes</title>
    <link>https://shouldiselfhost.com</link>
    <description>Every time the answer to "should I self-host it?" changes, with the reason.</description>
${items.join('\n')}
  </channel>
</rss>`
})

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
