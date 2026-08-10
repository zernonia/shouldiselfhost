// Full record for one SaaS page: app + its alternatives + their metrics + evidence artifacts.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const [apps, alternatives, metrics, site, changelog] = await Promise.all([
    getApps(), getAlternatives(), getMetrics(), getSite(), getChangelog(),
  ])
  const app = apps.find((a) => a.id === id)
  if (!app) throw createError({ statusCode: 404, statusMessage: `No app "${id}"` })

  const alts = app.alternatives
    .map((altId) => {
      const alt = alternatives.find((a: any) => a.id === altId)
      return alt ? { ...alt, metrics: metrics[altId] ?? null } : null
    })
    .filter(Boolean)

  const compose = app.compose
    ? await useStorage('assets:compose').getItem<string>(app.compose.replace(/^compose\//, ''))
    : null
  const log = app.verified?.evidence?.find((e) => e.startsWith('logs/'))
  const logMd = log ? await useStorage('assets:logs').getItem<string>(log.replace(/^logs\//, '')) : null

  return {
    site,
    app: withDerived(app, metrics, site?.hourly_rate_usd),
    alternatives: alts,
    compose,
    log: logMd,
    changelog: changelog.filter((c: any) => c.app === id),
  }
})
