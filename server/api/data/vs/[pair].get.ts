export default defineEventHandler(async (event) => {
  const pair = getRouterParam(event, 'pair')!
  const m = pair.match(/^([a-z0-9-]+)-vs-([a-z0-9-]+)$/)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Bad pair' })

  const [alternatives, apps, metrics, site] = await Promise.all([
    getAlternatives(), getApps(), getMetrics(), getSite(),
  ])

  // The slug splits ambiguously when ids contain hyphens; resolve against real ids.
  const ids = new Set(alternatives.map((a: any) => a.id))
  let a: string | null = null, b: string | null = null
  const body = pair.split('-vs-')
  if (body.length === 2 && ids.has(body[0]) && ids.has(body[1])) {
    [a, b] = body
  } else {
    for (const alt of alternatives) {
      if (pair.startsWith(`${alt.id}-vs-`)) {
        const rest = pair.slice(alt.id.length + 4)
        if (ids.has(rest)) { a = alt.id; b = rest; break }
      }
    }
  }
  if (!a || !b) throw createError({ statusCode: 404, statusMessage: 'Unknown pair' })

  const load = (id: string) => {
    const alt = alternatives.find((x: any) => x.id === id)
    return {
      ...alt,
      metrics: metrics[id] ?? null,
      replaces: apps
        .filter((app) => app.alternatives.includes(id))
        .map((app) => withDerived(app, metrics, site?.hourly_rate_usd)),
    }
  }
  return { a: load(a), b: load(b) }
})
