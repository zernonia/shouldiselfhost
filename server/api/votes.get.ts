// All vote counts + the headline number, derived live from the same function the homepage
// shows as code: escaped $/mo = Σ(app price × votes).
import { escapedUsdMo } from '#shared/derive.mjs'

export default defineEventHandler(async (event) => {
  const [counts, apps] = await Promise.all([voteCounts(event), getApps()])
  setHeader(event, 'cache-control', 'public, max-age=60')
  return { votes: counts, escaped_usd_mo: Math.round(escapedUsdMo(apps, counts) * 100) / 100 }
})
