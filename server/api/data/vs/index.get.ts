export default defineEventHandler(async () => {
  const [pairs, alternatives] = await Promise.all([vsPairs(), getAlternatives()])
  const byId = Object.fromEntries(alternatives.map((a: any) => [a.id, a]))
  return pairs.map(([a, b]) => ({
    slug: `${a}-vs-${b}`,
    a: { id: a, name: byId[a]?.name ?? a },
    b: { id: b, name: byId[b]?.name ?? b },
    category: byId[a]?.category ?? null,
  }))
})
