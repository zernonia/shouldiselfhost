// Internal list endpoint powering the homepage + boards (prerendered into page payloads).
export default defineEventHandler(async () => {
  const [apps, metrics, site] = await Promise.all([getApps(), getMetrics(), getSite()])
  return {
    site,
    apps: apps.map((a) => withDerived(a, metrics, site?.hourly_rate_usd)),
  }
})
