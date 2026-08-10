export default defineEventHandler(async (event) => {
  const body = await readBody<{ app?: string }>(event)
  const appId = body?.app
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'app required' })
  const apps = await getApps()
  if (!apps.some((a) => a.id === appId)) {
    throw createError({ statusCode: 404, statusMessage: `No app "${appId}"` })
  }
  return toggleVote(event, appId, await voterHash(event))
})
