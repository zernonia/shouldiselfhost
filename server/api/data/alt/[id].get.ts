// Full record for one OSS tool page: the tool + every SaaS page it serves.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const [apps, alternatives, metrics, site] = await Promise.all([
    getApps(), getAlternatives(), getMetrics(), getSite(),
  ])
  const alt = alternatives.find((a: any) => a.id === id)
  if (!alt) throw createError({ statusCode: 404, statusMessage: `No alternative "${id}"` })

  return {
    site,
    alt: { ...alt, metrics: metrics[id] ?? null },
    replaces: apps
      .filter((a) => a.alternatives.includes(id))
      .map((a) => withDerived(a, metrics, site?.hourly_rate_usd)),
  }
})
