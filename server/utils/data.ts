import {
  breakEvenMonths, breakEvenDate, markupIndex, netMonthlySavingUsd, selfHostCostUsdMo,
  setupCostUsd, isAbandoned, isStaleVerdict, DEFAULT_HOURLY_RATE,
} from '#shared/derive.mjs'

export interface AppRecord {
  id: string
  name: string
  domain?: string
  category: string
  price_usd_mo: number
  price_plan?: string
  price_unit?: string
  price_source: string
  price_checked: string
  jobs: string[]
  verdict: 'YES' | 'KINDA' | 'NOT_REALLY' | null
  verdict_reason?: string
  what_you_lose?: string[]
  alternatives: string[]
  economics?: { vps_share_usd_mo: number; storage_usd_mo?: number; maint_min_mo: number }
  hardware_tier?: 'pi' | 'old-laptop' | 'vps'
  provenance: { capability_seed?: string | null; decision_layer: 'original' }
  verified?: {
    by: string; at: string; protocol: string; setup_min: number
    assistant?: string; evidence: string[]; what_broke?: string[]
  } | null
  compose?: string
  links?: Record<string, string>
  notes?: string
}

const storage = () => useStorage('assets:appdata')

async function loadCollection<T>(prefix: string): Promise<T[]> {
  const keys = await storage().getKeys(prefix)
  const items = await Promise.all(
    keys.filter((k) => k.endsWith('.json')).map((k) => storage().getItem<T>(k)),
  )
  return items.filter(Boolean) as T[]
}

export const getApps = cachedFunction(
  async () => {
    const apps = await loadCollection<AppRecord>('apps')
    return apps.sort((a, b) => a.id.localeCompare(b.id))
  },
  { name: 'apps', maxAge: 3600, swr: true },
)

export const getAlternatives = cachedFunction(
  async () => loadCollection<any>('alternatives'),
  { name: 'alternatives', maxAge: 3600, swr: true },
)

export const getMetrics = cachedFunction(
  async () => {
    const all = await loadCollection<any>('metrics')
    return Object.fromEntries(all.map((m) => [m.id, m]))
  },
  { name: 'metrics', maxAge: 3600, swr: true },
)

export const getSite = cachedFunction(
  async () => storage().getItem<any>('site.json'),
  { name: 'site', maxAge: 3600, swr: true },
)

export const getChangelog = cachedFunction(
  async () => ((await storage().getItem<any[]>('changelog.json')) ?? []),
  { name: 'changelog', maxAge: 3600, swr: true },
)

/** Everything derived, at the site reference rate. Inputs stay raw so clients can re-derive. */
export function withDerived(app: AppRecord, metrics: Record<string, any>, rate = DEFAULT_HOURLY_RATE) {
  const m = metrics[app.alternatives?.[0]]
  return {
    ...app,
    derived: {
      hourly_rate_usd: rate,
      self_host_cost_usd_mo: round2(selfHostCostUsdMo(app.economics, rate)),
      net_saving_usd_mo: round2(netMonthlySavingUsd(app, rate)),
      setup_cost_usd: round2(setupCostUsd(app, rate)),
      break_even_months: round2(breakEvenMonths(app, rate)),
      break_even_date: breakEvenDate(app, rate),
      markup_index: round2(markupIndex(app, rate)),
      primary_abandoned: isAbandoned(m),
      verdict_stale: isStaleVerdict(app),
    },
  }
}

const round2 = (n: number | null) => (n == null ? null : Math.round(n * 100) / 100)
