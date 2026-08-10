// /vs pairs: two OSS tools that co-occur in some app's ranked alternatives — meaning at
// least one verdict page considers them competitors for the same jobs. Canonical slug is
// alphabetical: `${a}-vs-${b}`.
export async function vsPairs(): Promise<Array<[string, string]>> {
  const apps = await getApps()
  const seen = new Set<string>()
  const pairs: Array<[string, string]> = []
  for (const app of apps) {
    const alts = app.alternatives ?? []
    for (let i = 0; i < alts.length; i++) {
      for (let j = i + 1; j < alts.length; j++) {
        const [a, b] = [alts[i], alts[j]].sort()
        const key = `${a}-vs-${b}`
        if (!seen.has(key)) {
          seen.add(key)
          pairs.push([a, b])
        }
      }
    }
  }
  return pairs.sort((x, y) => x[0].localeCompare(y[0]))
}
