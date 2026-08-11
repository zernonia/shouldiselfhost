<script setup lang="ts">
// Homepage = the Rating Desk dossier (frame UJL2k). Pure Tailwind utilities;
// every figure derived from data/ or an authored review block; stubs labeled.
import {
  selfHostCostUsdMo, netMonthlySavingUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE, BREAK_EVEN_WINDOW_MO,
} from '#shared/derive.mjs'
import { dk, verdictText, verdictBg, verdictLabel } from '~/composables/deskClasses'

const { data } = await useFetch('/api/data/apps')
const apps = computed<any[]>(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a) => a.verdict))
const counts = computed(() => ({
  yes: scored.value.filter((a) => a.verdict === 'YES').length,
  kinda: scored.value.filter((a) => a.verdict === 'KINDA').length,
  no: scored.value.filter((a) => a.verdict === 'NOT_REALLY').length,
}))
const featured = computed(() => scored.value.find((a) => a.review) ?? scored.value[0])
const issueNo = computed(() => String(scored.value.length).padStart(3, '0'))
const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '—'
const fmtDateShort = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).toUpperCase() : '—'
const nextReview = computed(() => {
  const at = featured.value?.verified?.at
  if (!at) return '—'
  const d = new Date(at + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 12)
  return fmtDate(d.toISOString().slice(0, 10))
})

const q = ref('')
const lookupHits = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return []
  return scored.value
    .filter((a) => a.name.toLowerCase().includes(needle) || a.id.includes(needle))
    .slice(0, 6)
})

const activeCat = ref<string | null>(null)
const catChips = computed(() => {
  const m = new Map<string, number>()
  for (const a of scored.value) m.set(a.category ?? 'other', (m.get(a.category ?? 'other') ?? 0) + 1)
  return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 7)
})
const rollLimit = ref(12)
const rollAll = computed(() => {
  let list = [...scored.value].sort((a, b) =>
    String(b.verified?.at ?? '').localeCompare(String(a.verified?.at ?? '')) ||
    (markupIndex(b) ?? 0) - (markupIndex(a) ?? 0))
  if (activeCat.value) list = list.filter((a) => a.category === activeCat.value)
  const needle = q.value.trim().toLowerCase()
  if (needle) list = list.filter((a) => a.name.toLowerCase().includes(needle) || a.id.includes(needle))
  return list
})
const roll = computed(() => rollAll.value.slice(0, rollLimit.value))
const altCount = computed(() => new Set(apps.value.flatMap((a) => a.alternatives ?? [])).size)

const stopSum = computed(() => scored.value.filter((a) => a.verdict === 'YES').reduce((s, a) => s + a.price_usd_mo, 0))
const staySum = computed(() => scored.value.filter((a) => a.verdict === 'NOT_REALLY').reduce((s, a) => s + a.price_usd_mo, 0))
const odoChars = computed(() => Math.round(stopSum.value).toLocaleString('en-US').split(''))

const rate = DEFAULT_HOURLY_RATE
const model = computed(() => {
  const a = featured.value
  if (!a?.economics) return null
  const maint = (a.economics.maint_min_mo / 60) * rate
  return {
    sub: a.price_usd_mo, vps: a.economics.vps_share_usd_mo,
    storage: a.economics.storage_usd_mo ?? 0, maintMin: a.economics.maint_min_mo, maint,
    allIn: selfHostCostUsdMo(a.economics, rate), markup: markupIndex(a, rate), breakEven: breakEvenMonths(a, rate),
  }
})

const sensitivity = computed(() => {
  const yes = scored.value.filter((a) => a.verdict === 'YES' && a.economics)
  const fallAt60 = yes.filter((a) => { const be = breakEvenMonths(a, 60); return be == null || be > BREAK_EVEN_WINDOW_MO }).length
  const others = scored.value.filter((a) => a.verdict !== 'YES' && a.economics)
  const clearAt0 = others.filter((a) => {
    const be = breakEvenMonths(a, 0); const saving = netMonthlySavingUsd(a, 0)
    return saving != null && saving > 0 && be != null && be <= BREAK_EVEN_WINDOW_MO
  }).length
  return { yesCount: yes.length, fallAt60, clearAt0 }
})

const votes = ref<Record<string, number>>({})
onMounted(async () => {
  try { votes.value = (await $fetch<{ votes: Record<string, number> }>('/api/votes')).votes } catch {}
})
const mostSwapped = computed(() =>
  [...scored.value].map((a) => ({ ...a, v: votes.value[a.id] ?? 0 })).filter((a) => a.v > 0)
    .sort((a, b) => b.v - a.v).slice(0, 5))

const scaleMeta = [
  { key: 'YES', count: () => counts.value.yes, border: 'border-yes', def: 'Self-host it. The alternative is credible, the migration is survivable, and the maths is not close.', examples: 'Plausible · Uptime Kuma · Stirling PDF · Grist' },
  { key: 'KINDA', count: () => counts.value.kinda, border: 'border-kinda', def: 'Only if the box already exists. On a machine you run anyway the case is fine; standing one up for this is not.', examples: 'Notion · Dropbox · Figma · Trello' },
  { key: 'NOT_REALLY', count: () => counts.value.no, border: 'border-no', def: 'Keep paying. The alternative exists and still loses once your hours and the cost of it being down are priced.', examples: '1Password · Copilot · Lightroom · Zoom' },
] as const

const mrow = 'flex items-center justify-between gap-4 border-b border-surface-2 py-[11px] text-[13px] text-t2'
const mval = 'font-mono tabular-nums text-[13.5px] font-semibold'
const constCard = 'flex flex-col gap-[9px] border-t border-line pt-[18px]'
const constLabel = 'font-mono text-[9.5px] tracking-[1.3px] text-t3'
const constValue = 'font-display text-[21px] font-semibold tracking-[-0.6px] text-t1'
const constNote = 'text-[12.5px] leading-[1.55] text-t3'
const colHead = 'font-mono text-[9.5px] font-semibold tracking-[1.3px] text-faint'
const stub = 'border border-dashed border-line px-4 py-[14px] [&>p]:m-0 [&>p]:text-[12.5px] [&>p]:leading-[1.6] [&>p]:text-t3'
const lookupBox = 'flex items-center gap-[10px] border border-line bg-surface px-4 py-[14px] font-mono'

useHead({ title: 'Should I self-host it?' })
useSeoMeta({ description: () => `The rating desk for self-hosting: ${scored.value.length} paid apps rated YES / KINDA / NOT REALLY with the honest math published.` })
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute inset-0 overflow-clip max-[900px]:hidden" aria-hidden="true">
      <div class="absolute -top-[140px] right-[2%] font-display text-[660px] font-bold leading-none text-[#11151B]">?</div>
      <div class="absolute -left-[30px] top-[46%] font-display text-[300px] font-bold leading-none tracking-[-14px] text-[#0E1116]">{{ issueNo }}</div>
    </div>

    <!-- 01 Abstract -->
    <section :class="dk.row" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">01</div>
        <div :class="dk.secName">ABSTRACT</div>
      </div>
      <div :class="dk.body">
        <div class="flex max-w-[700px] flex-col gap-[30px]">
          <h1 class="m-0 font-display text-[clamp(34px,4vw,56px)] font-medium leading-[1.05] tracking-[-2.2px] text-t1">
            Should I self-host <span class="mx-[6px] inline-flex gap-[7px]"><i class="inline-block h-[6px] w-7 bg-yes" /><i class="inline-block h-[6px] w-7 bg-yes" /><i class="inline-block h-[6px] w-7 bg-yes" /></span> ?
          </h1>
          <p class="m-0 max-w-[620px] text-base leading-[1.68] text-t2">One question, asked of {{ scored.length }} paid apps: is running it yourself actually cheaper once your own hours are on the invoice?</p>
          <div class="relative max-w-[620px]">
            <label :class="lookupBox">
              <span class="text-sm font-bold text-yes">&gt;</span>
              <input v-model="q" type="search" placeholder="type an app…" class="flex-1 border-none bg-transparent p-0 font-mono text-sm text-t1 outline-none placeholder:text-t3" />
              <span v-if="!q" class="h-[17px] w-2 animate-blink bg-yes motion-reduce:animate-none" />
              <span class="text-[11.5px] text-dim">{{ scored.length }} rated</span>
            </label>
            <div v-if="lookupHits.length" class="absolute inset-x-0 top-full z-10 border border-t-0 border-line bg-surface">
              <NuxtLink v-for="h in lookupHits" :key="h.id" :to="`/${h.id}`" class="flex items-center gap-[10px] border-b border-surface-2 px-4 py-[10px] text-t1 hover:bg-surface-2">
                <DeskAppAvatar :id="h.id" :name="h.name" :verdict="h.verdict" :size="24" />
                <span class="flex-1 text-[13.5px] font-medium">{{ h.name }}</span>
                <DeskRatingTag :verdict="h.verdict" />
              </NuxtLink>
            </div>
            <div v-else-if="q" class="absolute inset-x-0 top-full z-10 border border-t-0 border-line bg-surface px-4 py-[10px] font-mono text-[12.5px] text-t3">
              Not rated yet — that page is one <a href="https://github.com/zernonia/shouldiselfhost/blob/main/CONTRIBUTING.md" class="text-t2 underline">evidence-backed PR</a> away.
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-end justify-between gap-10 border-t border-line pt-[34px]">
          <div class="flex flex-col gap-[13px]">
            <div :class="dk.microLabel">MONTHLY SPEND WE SAY YOU CAN STOP</div>
            <div class="flex items-center gap-2">
              <span class="font-display text-[30px] font-bold tracking-[-1px] text-t3">$</span>
              <template v-for="(ch, i) in odoChars" :key="i">
                <span v-if="ch === ','" class="font-display text-[30px] font-bold tracking-[-1px] text-t3">,</span>
                <span v-else class="inline-flex h-16 w-[46px] items-center justify-center rounded-[3px] border border-line bg-surface font-display text-[34px] font-bold tracking-[-1px] text-yes">{{ ch }}</span>
              </template>
              <span class="font-mono text-sm text-t3">/mo</span>
            </div>
            <div class="font-mono text-[11.5px] text-t3">the {{ counts.yes }} YES verdicts, added up</div>
          </div>
          <div class="flex flex-col items-end gap-[9px]">
            <div :class="dk.microLabel">AND THE HONEST HALF</div>
            <div class="font-display text-[22px] font-semibold tracking-[-0.8px] text-t1">${{ Math.round(staySum) }}/mo stays where it is</div>
            <div class="font-mono text-[11.5px] text-t3">{{ counts.no }} NOT REALLY verdicts · no click chasing</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 The Scale -->
    <section :class="dk.row" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">02</div>
        <div :class="dk.secName">THE SCALE</div>
      </div>
      <div :class="dk.body">
        <p class="m-0 max-w-[820px] text-[15px] leading-[1.68] text-t2">Three grades, defined once and applied identically to all hundred. The grade answers a single question: at your cost of time, does running it yourself come out ahead?</p>
        <div class="grid grid-cols-3 gap-8 max-[900px]:grid-cols-1">
          <div v-for="s in scaleMeta" :key="s.key" class="flex flex-col gap-4 border-t-2 pt-5" :class="s.border">
            <DeskRatingTag :verdict="s.key" />
            <div class="flex items-end gap-[9px]">
              <span class="font-display text-[46px] font-semibold leading-none tracking-[-2px] text-t1">{{ s.count() }}</span>
              <span class="font-mono text-[11.5px] text-t3">of {{ scored.length }} rated</span>
            </div>
            <div class="h-1 bg-[#181B21]"><div class="h-full" :class="verdictBg(s.key)" :style="{ width: (s.count() / scored.length * 100) + '%' }" /></div>
            <p class="m-0 text-[13.5px] leading-[1.65] text-t2">{{ s.def }}</p>
            <p class="m-0 font-mono text-[11.5px] leading-[1.6] text-t3">{{ s.examples }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 Rating Action -->
    <section v-if="featured" :class="[dk.row, dk.rowTinted]" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">03</div>
        <div :class="dk.secName">RATING ACTION</div>
        <div :class="dk.secSub">#{{ issueNo }}</div>
      </div>
      <div :class="dk.body" class="gap-6!">
        <div class="flex flex-wrap items-center justify-between gap-10">
          <div class="flex items-center gap-[14px]">
            <DeskAppAvatar :id="featured.id" :name="featured.name" :verdict="featured.verdict" :size="36" />
            <div class="flex flex-col gap-[3px]">
              <div class="font-display text-[21px] font-semibold tracking-[-0.6px]">{{ featured.name }}</div>
              <div class="font-mono text-[11.5px] text-t3">{{ featured.category }} · ${{ featured.price_usd_mo }}/mo · alternative: {{ featured.alternatives?.[0] }}</div>
            </div>
          </div>
          <div class="flex items-center gap-[34px]">
            <div class="flex flex-col gap-[7px]">
              <div class="font-mono text-[9.5px] tracking-[1.3px] text-dim">RATING</div>
              <DeskRatingTag :verdict="featured.verdict" />
            </div>
            <div class="flex flex-col gap-[7px]">
              <div class="font-mono text-[9.5px] tracking-[1.3px] text-dim">OUTLOOK</div>
              <DeskOutlookMark :outlook="featured.review?.outlook ?? null" />
            </div>
          </div>
        </div>
        <div :class="dk.ruleH" />
        <div class="flex flex-wrap items-center gap-[11px] font-display text-[clamp(22px,2.4vw,30px)] font-medium tracking-[-1px]">
          <span>{{ featured.review?.action === 'affirmed' ? 'Affirmed at' : 'Rated' }}</span>
          <span class="font-semibold" :class="verdictText(featured.verdict)">{{ verdictLabel(featured.verdict) }}</span>
          <span v-if="featured.review?.outlook">— outlook {{ featured.review.outlook }}.</span>
        </div>
        <div class="flex gap-12 max-[1000px]:flex-col">
          <div class="flex min-w-0 max-w-[660px] flex-1 flex-col gap-[22px]">
            <div :class="dk.microLabel">RATIONALE</div>
            <p v-for="(p, i) in featured.review?.rationale ?? [featured.verdict_reason]" :key="i" class="m-0 text-[14.5px] leading-[1.72] text-t2">{{ p }}</p>
            <div :class="dk.ruleH" />
            <template v-if="featured.review?.conditions?.length">
              <div :class="dk.microLabel" class="text-yes!">WHAT WOULD CHANGE OUR MIND</div>
              <div v-for="(c, i) in featured.review.conditions" :key="c" :class="dk.condition">
                <span :class="dk.conditionIdx">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ c }}</p>
              </div>
            </template>
            <NuxtLink :to="`/${featured.id}`" :class="dk.chip" class="self-start">Full facts panel
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </NuxtLink>
          </div>
          <div v-if="model" class="flex w-[452px] shrink-0 flex-col border-l border-line pl-7 max-[1000px]:w-full max-[1000px]:border-l-0 max-[1000px]:border-t max-[1000px]:pl-0 max-[1000px]:pt-5">
            <div :class="dk.microLabel" class="mb-2">MODEL INPUTS · $ PER MONTH</div>
            <div :class="mrow"><span>Subscription</span><span :class="mval" class="text-[14.5px] font-bold text-t1">{{ model.sub.toFixed(2) }}</span></div>
            <div :class="mrow"><span>VPS share</span><span :class="mval">{{ model.vps.toFixed(2) }}</span></div>
            <div :class="mrow"><span>Storage</span><span :class="mval">{{ model.storage.toFixed(2) }}</span></div>
            <div :class="mrow"><span>Your hours · {{ model.maintMin }} min @ ${{ rate }}</span><span :class="mval">{{ model.maint.toFixed(2) }}</span></div>
            <div :class="mrow" class="border-line font-semibold text-t1"><span>Self-host all-in</span><span :class="mval" class="text-[14.5px] font-bold text-t1">{{ model.allIn.toFixed(2) }}</span></div>
            <div :class="mrow"><span>Effective markup</span><span :class="[mval, (model.markup ?? 0) < 1 ? 'text-no' : 'text-yes']">{{ model.markup?.toFixed(2) ?? '—' }}×</span></div>
            <div :class="mrow"><span>Break-even</span><span :class="[mval, model.breakEven == null ? 'text-no' : '']">{{ model.breakEven == null ? 'never' : model.breakEven.toFixed(1) + ' mo' }}</span></div>
            <div class="flex flex-col gap-5 pt-6">
              <p class="m-0 text-[12px] leading-[1.6] text-t3">OUTLOOK — the direction we expect this rating to move within twelve months. Positive means the case for self-hosting is strengthening.</p>
              <div class="flex justify-between gap-5">
                <div><div :class="dk.metaLabel">LAST REVIEWED</div><div :class="dk.metaValue">{{ fmtDate(featured.verified?.at) }}</div></div>
                <div><div :class="dk.metaLabel">NEXT REVIEW</div><div :class="dk.metaValue">{{ nextReview }}</div></div>
                <div><div :class="dk.metaLabel">PROTOCOL</div><div :class="dk.metaValue">{{ featured.verified?.protocol ?? 'v1' }}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pull quote -->
    <section :class="dk.row" class="relative py-[86px]!">
      <div :class="dk.gutter"><div class="font-mono text-[12px] text-dim">——</div></div>
      <div :class="dk.body">
        <div class="font-display text-[clamp(30px,4vw,54px)] font-medium leading-[1.14] tracking-[-2px]">
          <div>Thirty-one times in a hundred,</div>
          <div>the honest answer is <span class="text-no">keep paying.</span></div>
        </div>
        <div class="mt-[26px] font-mono text-[13px] text-t3">— and we would rather lose the click than pretend otherwise.</div>
      </div>
    </section>

    <!-- 04 The Roll -->
    <section id="roll" :class="dk.row" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">04</div>
        <div :class="dk.secName">THE ROLL</div>
      </div>
      <div :class="dk.body">
        <div class="flex max-w-[700px] flex-col gap-[10px]">
          <div :class="dk.rollTitle">The roll, most recently reviewed first</div>
          <p :class="dk.rollSub">Every rating carries a review date. A rating older than twelve months is marked stale and excluded from the headline counts.</p>
        </div>
        <div class="flex flex-wrap gap-[9px]">
          <button :class="[dk.chip, !activeCat && dk.chipActive]" @click="activeCat = null">all <span class="text-[10.5px]" :class="activeCat ? 'text-faint' : 'text-bg'">{{ scored.length }}</span></button>
          <button v-for="[cat, n] in catChips" :key="cat" :class="[dk.chip, activeCat === cat && dk.chipActive]" @click="activeCat = activeCat === cat ? null : cat">{{ cat }} <span class="text-[10.5px]" :class="activeCat === cat ? 'text-bg' : 'text-faint'">{{ n }}</span></button>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-6 border border-yes bg-[#34D3990D] px-[18px] py-[14px]">
          <div class="flex flex-wrap items-baseline gap-[9px]">
            <span class="font-mono text-[12.5px] font-bold text-yes">{{ altCount }} open-source alternatives</span>
            <span class="text-[13.5px] text-t2">across the {{ scored.length }} rated apps — even behind a NOT REALLY.</span>
          </div>
        </div>
        <div class="flex flex-col overflow-x-auto">
          <div :class="dk.thead">
            <span :class="dk.cEntity">ENTITY / ALTERNATIVE</span>
            <span :class="dk.cRating">RATING</span>
            <span :class="dk.cOutlook">OUTLOOK</span>
            <span :class="dk.cBar">MARKUP</span>
            <span :class="dk.cRatio" />
            <span :class="dk.cBreak">BREAK-EVEN</span>
            <span :class="dk.cRev">REVIEWED</span>
            <span :class="dk.cSwap">SWAPPED</span>
          </div>
          <NuxtLink v-for="a in roll" :key="a.id" :to="`/${a.id}`" :class="dk.trow" class="group">
            <span :class="dk.cEntity" class="flex items-center gap-3">
              <DeskAppAvatar :id="a.id" :name="a.name" :verdict="a.verdict" :size="30" />
              <span class="flex flex-col gap-[2px]">
                <span class="text-[14.5px] font-semibold text-t1 transition-colors group-hover:text-yes">{{ a.name }}</span>
                <span class="font-mono text-[11px] text-t3">{{ a.alternatives?.[0] ?? '—' }}</span>
              </span>
            </span>
            <span :class="dk.cRating"><DeskRatingBadge :verdict="a.verdict" /></span>
            <span :class="dk.cOutlook"><DeskOutlookMark :outlook="a.review?.outlook ?? null" /></span>
            <span :class="dk.cBar"><span class="block h-[5px] bg-[#181B21]"><span class="block h-full" :class="verdictBg(a.verdict)" :style="{ width: Math.min(100, ((markupIndex(a) ?? 0) / 18) * 100) + '%' }" /></span></span>
            <span :class="dk.cRatio">{{ markupIndex(a) != null ? markupIndex(a)!.toFixed(1) + '×' : '—' }}</span>
            <span :class="dk.cBreak">{{ breakEvenMonths(a) == null ? 'never' : breakEvenMonths(a)!.toFixed(1) + ' mo' }}</span>
            <span :class="dk.cRev">{{ fmtDateShort(a.verified?.at) }}</span>
            <span :class="dk.cSwap">{{ (votes[a.id] ?? 0) > 0 ? votes[a.id] : '—' }}</span>
          </NuxtLink>
        </div>
        <button v-if="rollAll.length > rollLimit" :class="dk.chip" class="self-start" @click="rollLimit += 24">Show {{ Math.min(24, rollAll.length - rollLimit) }} more of {{ rollAll.length }}</button>
      </div>
    </section>

    <!-- 05 Live Desk -->
    <section :class="[dk.row, dk.rowTinted]" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">05</div>
        <div :class="dk.secName">LIVE DESK</div>
      </div>
      <div :class="dk.body" class="gap-[30px]!">
        <div class="flex max-w-[720px] flex-col gap-[10px]">
          <div :class="dk.rollTitle">Who is reading, and what they actually swapped</div>
          <p :class="dk.rollSub">Our verdict is one opinion. What readers actually cancelled is another, and we publish both.</p>
        </div>
        <div class="flex flex-wrap gap-10">
          <div class="flex w-[480px] flex-col gap-[14px] max-[600px]:w-full">
            <div :class="colHead">RECENT ACTIVITY</div>
            <div :class="stub">
              <p>Comes online with privacy-preserving, self-hosted analytics — a YES verdict we intend to dogfood. Until then this column stays empty, because we don't simulate readers.</p>
            </div>
          </div>
          <div class="flex w-[280px] flex-col gap-[14px]">
            <div :class="colHead">READERS BY COUNTRY · 24H</div>
            <div :class="stub"><p>Same story — real numbers or none.</p></div>
          </div>
          <div class="flex w-[320px] flex-col gap-[14px]">
            <div :class="colHead">MOST SWAPPED THIS WEEK</div>
            <template v-if="mostSwapped.length">
              <div v-for="(a, i) in mostSwapped" :key="a.id" class="flex items-center gap-3 border-b border-surface-2 py-[9px]">
                <span class="font-mono text-[11.5px] text-faint">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="flex-1 text-[13px] font-medium text-t1">{{ a.name }}</span>
                <span class="font-mono text-[13px] font-bold text-yes">{{ a.v }}</span>
              </div>
            </template>
            <div v-else :class="stub"><p>No reader votes yet — the ✋ on every rating page feeds this list.</p></div>
          </div>
        </div>
        <p :class="dk.liveNote">Votes are self-reported, one per browser, and never touch the verdict. They are the only number on this site we do not control.</p>
      </div>
    </section>

    <!-- 06 The Model -->
    <section :class="[dk.row, dk.rowTinted]" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">06</div>
        <div :class="dk.secName">THE MODEL</div>
      </div>
      <div :class="dk.body" class="gap-[30px]!">
        <div :class="dk.rollTitle" class="max-w-[820px] leading-[1.25]">The model is public — and so are the numbers that break it</div>
        <div class="flex flex-col gap-4 overflow-x-auto rounded-[10px] border border-line bg-surface p-[30px] font-mono">
          <div class="whitespace-nowrap text-[17px] font-semibold tracking-[-0.2px] text-t1">break_even_months&nbsp;&nbsp;=&nbsp;&nbsp;setup_cost&nbsp;&nbsp;÷&nbsp;&nbsp;( subscription&nbsp;&nbsp;−&nbsp;&nbsp;self_host_run_rate )</div>
          <div class="whitespace-nowrap text-sm text-t2">self_host_run_rate&nbsp;&nbsp;=&nbsp;&nbsp;vps_share&nbsp;&nbsp;+&nbsp;&nbsp;storage&nbsp;&nbsp;+&nbsp;&nbsp;maintenance_hours × your_rate</div>
        </div>
        <div class="grid grid-cols-4 gap-6 max-[900px]:grid-cols-1">
          <div :class="constCard"><div :class="constLabel">LABOUR</div><div :class="constValue">${{ rate }} / hr</div><div :class="constNote">Deliberately cheap. Raise it.</div></div>
          <div :class="constCard"><div :class="constLabel">BREAK-EVEN WINDOW</div><div :class="constValue">{{ BREAK_EVEN_WINDOW_MO }} mo</div><div :class="constNote">Past this, we say keep paying</div></div>
          <div :class="constCard"><div :class="constLabel">STALENESS</div><div :class="constValue">12 mo</div><div :class="constNote">Ratings expire; re-review or flagged</div></div>
          <div :class="constCard"><div :class="constLabel">YES CEILING</div><div :class="constValue">≤ 2 hrs</div><div :class="constNote">Measured setup, or it isn't a YES</div></div>
        </div>
        <div class="flex flex-col gap-[11px] border-l-2 border-kinda py-[2px] pl-6">
          <div class="font-mono text-[10px] font-semibold tracking-[1.3px] text-kinda">DISCLOSED SENSITIVITY</div>
          <p class="m-0 max-w-[880px] text-[14.5px] leading-[1.7] text-t2">Raise labour to $60/hr — a realistic senior rate — and {{ sensitivity.fallAt60 }} of the {{ sensitivity.yesCount }} YES ratings fall outside the break-even window. Set your time to $0/hr — the homelab position — and {{ sensitivity.clearAt0 }} of the ratings we scored against you clear the bar. Every rating on this site is a function of a number we picked on your behalf, so we publish it, the data, and the code that computes it. Disagree with us with your own inputs — every page has the slider.</p>
        </div>
        <div class="flex flex-wrap gap-[10px]">
          <a href="/api/apps.json" :class="dk.chip">Open the data (JSON)</a>
          <NuxtLink to="/methodology" :class="dk.chip">The standard · protocol v1</NuxtLink>
          <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json" :class="dk.chip">Changelog</a>
        </div>
      </div>
    </section>

    <!-- 07 Dispatches -->
    <section :class="dk.row" class="relative">
      <div :class="dk.gutter">
        <div :class="dk.secNo">07</div>
        <div :class="dk.secName">DISPATCHES</div>
      </div>
      <div :class="dk.body">
        <DeskNewsletter />
      </div>
    </section>
  </div>
</template>
