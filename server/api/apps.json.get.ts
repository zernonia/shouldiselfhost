// The public dataset — free with attribution (CC BY-SA 4.0 for the decision layer).
// Commercial API dual-licensing comes later; this endpoint stays free forever.
export default defineEventHandler(async (event) => {
  const [apps, alternatives, metrics, site] = await Promise.all([
    getApps(), getAlternatives(), getMetrics(), getSite(),
  ])
  setHeader(event, 'access-control-allow-origin', '*')
  return {
    _license: 'Decision-layer data CC BY-SA 4.0 (https://shouldiselfhost.com) · capability seed MIT (https://github.com/caniselfhostit/caniselfhostit)',
    _generated: new Date().toISOString().slice(0, 10),
    site,
    apps: apps.map((a) => withDerived(a, metrics, site?.hourly_rate_usd)),
    alternatives: alternatives.map((a: any) => ({ ...a, metrics: metrics[a.id] ?? null })),
  }
})
