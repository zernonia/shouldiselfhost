export default defineEventHandler(async (event) => {
  const [apps, alternatives, pairs] = await Promise.all([getApps(), getAlternatives(), vsPairs()])
  const urls = [
    '', 'methodology', 'vs', 'stack',
    ...apps.map((a) => a.id),
    ...alternatives.map((a: any) => `app/${a.id}`),
    ...pairs.map(([a, b]) => `vs/${a}-vs-${b}`),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>https://shouldiselfhost.com/${u}</loc></url>`).join('\n')}
</urlset>`
})
