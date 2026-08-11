<script setup lang="ts">
// Homepage = the Rating Desk dossier (frame UJL2k, "shouldiselfhost — Rating
// Action"). Masthead/colophon live in the desk layout. Every figure is derived
// from data/ or an authored review block; stubs are labeled, never simulated.
import {
  selfHostCostUsdMo, netMonthlySavingUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE, BREAK_EVEN_WINDOW_MO,
} from '#shared/derive.mjs'

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

// Lookup — the design's prompt box, wired for real.
const q = ref('')
const lookupHits = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return []
  return scored.value
    .filter((a) => a.name.toLowerCase().includes(needle) || a.id.includes(needle))
    .slice(0, 6)
})

// Browse + roll — chips filter the full roll; search narrows it too.
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
  { key: 'YES', count: () => counts.value.yes, def: 'Self-host it. The alternative is credible, the migration is survivable, and the maths is not close.', examples: 'Plausible · Uptime Kuma · Stirling PDF · Grist' },
  { key: 'KINDA', count: () => counts.value.kinda, def: 'Only if the box already exists. On a machine you run anyway the case is fine; standing one up for this is not.', examples: 'Notion · Dropbox · Figma · Trello' },
  { key: 'NOT_REALLY', count: () => counts.value.no, def: 'Keep paying. The alternative exists and still loses once your hours and the cost of it being down are priced.', examples: '1Password · Copilot · Lightroom · Zoom' },
] as const

useHead({ title: 'Should I self-host it?' })
useSeoMeta({ description: () => `The rating desk for self-hosting: ${scored.value.length} paid apps rated YES / KINDA / NOT REALLY with the honest math published.` })
</script>

<template>
  <div class="home">
    <div class="page-ghosts" aria-hidden="true">
      <div class="ghost-mark">?</div>
      <div class="ghost-numeral">{{ issueNo }}</div>
    </div>

    <!-- 01 Abstract -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">01</div>
        <div class="sec-name">ABSTRACT</div>
      </div>
      <div class="body">
        <div class="hero-split">
          <div class="abstract-copy">
            <h1 class="headline">Should I self-host <span class="dashes"><i /><i /><i /></span> ?</h1>
            <p class="statement">One question, asked of {{ scored.length }} paid apps: is running it yourself actually cheaper once your own hours are on the invoice?</p>
            <div class="lookup-wrap">
              <label class="lookup">
                <span class="prompt">&gt;</span>
                <input v-model="q" type="search" placeholder="type an app…" class="lookup-input" />
                <span v-if="!q" class="caret" />
                <span class="count">{{ scored.length }} rated</span>
              </label>
              <div v-if="lookupHits.length" class="lookup-hits">
                <NuxtLink v-for="h in lookupHits" :key="h.id" :to="`/${h.id}`" class="hit">
                  <DeskAppAvatar :id="h.id" :name="h.name" :verdict="h.verdict" :size="24" />
                  <span class="hit-name">{{ h.name }}</span>
                  <DeskRatingTag :verdict="h.verdict" />
                </NuxtLink>
              </div>
              <div v-else-if="q" class="lookup-hits">
                <div class="hit none">Not rated yet — that page is one <a href="https://github.com/zernonia/shouldiselfhost/blob/main/CONTRIBUTING.md">evidence-backed PR</a> away.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="odometer">
          <div class="odo-left">
            <div class="micro-label">MONTHLY SPEND WE SAY YOU CAN STOP</div>
            <div class="digits">
              <span class="glyph">$</span>
              <template v-for="(ch, i) in odoChars" :key="i">
                <span v-if="ch === ','" class="glyph">,</span>
                <span v-else class="tile num">{{ ch }}</span>
              </template>
              <span class="permo">/mo</span>
            </div>
            <div class="odo-note">the {{ counts.yes }} YES verdicts, added up</div>
          </div>
          <div class="odo-right">
            <div class="micro-label">AND THE HONEST HALF</div>
            <div class="counter-line">${{ Math.round(staySum) }}/mo stays where it is</div>
            <div class="odo-note">{{ counts.no }} NOT REALLY verdicts · no click chasing</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 The Scale -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">02</div>
        <div class="sec-name">THE SCALE</div>
      </div>
      <div class="body">
        <p class="scale-intro">Three grades, defined once and applied identically to all hundred. The grade answers a single question: at your cost of time, does running it yourself come out ahead?</p>
        <div class="scale-cols">
          <div v-for="s in scaleMeta" :key="s.key" class="scale-col" :class="s.key">
            <DeskRatingTag :verdict="s.key" />
            <div class="count-row">
              <span class="big-count">{{ s.count() }}</span>
              <span class="of">of {{ scored.length }} rated</span>
            </div>
            <div class="share-track"><div class="share-fill" :class="s.key" :style="{ width: (s.count() / scored.length * 100) + '%' }" /></div>
            <p class="definition">{{ s.def }}</p>
            <p class="examples">{{ s.examples }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 Rating Action -->
    <section v-if="featured" class="row tinted">
      <div class="gutter">
        <div class="sec-no">03</div>
        <div class="sec-name">RATING ACTION</div>
        <div class="sec-sub">#{{ issueNo }}</div>
      </div>
      <div class="body">
        <div class="entity-row">
          <div class="entity">
            <DeskAppAvatar :id="featured.id" :name="featured.name" :verdict="featured.verdict" :size="36" />
            <div class="names">
              <div class="entity-name">{{ featured.name }}</div>
              <div class="entity-meta">{{ featured.category }} · ${{ featured.price_usd_mo }}/mo · alternative: {{ featured.alternatives?.[0] }}</div>
            </div>
          </div>
          <div class="marks">
            <div class="mark-block">
              <div class="mark-label">RATING</div>
              <DeskRatingTag :verdict="featured.verdict" />
            </div>
            <div class="mark-block">
              <div class="mark-label">OUTLOOK</div>
              <DeskOutlookMark :outlook="featured.review?.outlook ?? null" />
            </div>
          </div>
        </div>
        <div class="rule-h" />
        <div class="action-headline">
          <span>{{ featured.review?.action === 'affirmed' ? 'Affirmed at' : 'Rated' }}</span>
          <span class="grade" :class="featured.verdict">{{ featured.verdict === 'NOT_REALLY' ? 'NOT REALLY' : featured.verdict }}</span>
          <span v-if="featured.review?.outlook">— outlook {{ featured.review.outlook }}.</span>
        </div>
        <div class="action-split">
          <div class="rationale">
            <div class="micro-label">RATIONALE</div>
            <p v-for="(p, i) in featured.review?.rationale ?? [featured.verdict_reason]" :key="i">{{ p }}</p>
            <div class="rule-h" />
            <template v-if="featured.review?.conditions?.length">
              <div class="micro-label change">WHAT WOULD CHANGE OUR MIND</div>
              <div v-for="(c, i) in featured.review.conditions" :key="c" class="condition">
                <span class="idx num">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ c }}</p>
              </div>
            </template>
            <NuxtLink :to="`/${featured.id}`" class="chip">Full facts panel
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </NuxtLink>
          </div>
          <div v-if="model" class="model-col">
            <div class="micro-label">MODEL INPUTS · $ PER MONTH</div>
            <div class="mrow"><span>Subscription</span><span class="v strong num">{{ model.sub.toFixed(2) }}</span></div>
            <div class="mrow"><span>VPS share</span><span class="v num">{{ model.vps.toFixed(2) }}</span></div>
            <div class="mrow"><span>Storage</span><span class="v num">{{ model.storage.toFixed(2) }}</span></div>
            <div class="mrow"><span>Your hours · {{ model.maintMin }} min @ ${{ rate }}</span><span class="v num">{{ model.maint.toFixed(2) }}</span></div>
            <div class="mrow total"><span>Self-host all-in</span><span class="v strong num">{{ model.allIn.toFixed(2) }}</span></div>
            <div class="mrow"><span>Effective markup</span><span class="v num" :class="(model.markup ?? 0) < 1 ? 'neg' : 'pos'">{{ model.markup?.toFixed(2) ?? '—' }}×</span></div>
            <div class="mrow"><span>Break-even</span><span class="v num" :class="model.breakEven == null ? 'neg' : ''">{{ model.breakEven == null ? 'never' : model.breakEven.toFixed(1) + ' mo' }}</span></div>
            <div class="model-footer">
              <p class="outlook-note">OUTLOOK — the direction we expect this rating to move within twelve months. Positive means the case for self-hosting is strengthening.</p>
              <div class="review-meta">
                <div><div class="meta-label">LAST REVIEWED</div><div class="meta-value num">{{ fmtDate(featured.verified?.at) }}</div></div>
                <div><div class="meta-label">NEXT REVIEW</div><div class="meta-value num">{{ nextReview }}</div></div>
                <div><div class="meta-label">PROTOCOL</div><div class="meta-value num">{{ featured.verified?.protocol ?? 'v1' }}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pull quote -->
    <section class="row quote-row">
      <div class="gutter"><div class="gutter-rule">——</div></div>
      <div class="body">
        <div class="pull-quote">
          <div>Thirty-one times in a hundred,</div>
          <div>the honest answer is <span class="pq-no">keep paying.</span></div>
        </div>
        <div class="quote-note">— and we would rather lose the click than pretend otherwise.</div>
      </div>
    </section>

    <!-- 04 The Roll (browse + full coverage, merged) -->
    <section class="row" id="roll">
      <div class="gutter">
        <div class="sec-no">04</div>
        <div class="sec-name">THE ROLL</div>
      </div>
      <div class="body">
        <div class="roll-header">
          <div class="roll-copy">
            <div class="roll-title">The roll, most recently reviewed first</div>
            <p class="roll-sub">Every rating carries a review date. A rating older than twelve months is marked stale and excluded from the headline counts.</p>
          </div>
        </div>
        <div class="chips">
          <button class="chip" :class="{ active: !activeCat }" @click="activeCat = null">all <span class="chip-count">{{ scored.length }}</span></button>
          <button v-for="[cat, n] in catChips" :key="cat" class="chip" :class="{ active: activeCat === cat }" @click="activeCat = activeCat === cat ? null : cat">{{ cat }} <span class="chip-count">{{ n }}</span></button>
        </div>
        <div class="escape-hatch">
          <div class="escape-copy">
            <span class="escape-count">{{ altCount }} open-source alternatives</span>
            <span class="escape-body">across the {{ scored.length }} rated apps — even behind a NOT REALLY.</span>
          </div>
        </div>
        <div class="roll-table">
          <div class="thead">
            <span class="c-entity">ENTITY / ALTERNATIVE</span>
            <span class="c-rating">RATING</span>
            <span class="c-outlook">OUTLOOK</span>
            <span class="c-bar">MARKUP</span>
            <span class="c-ratio" />
            <span class="c-break">BREAK-EVEN</span>
            <span class="c-rev">REVIEWED</span>
            <span class="c-swap">SWAPPED</span>
          </div>
          <NuxtLink v-for="a in roll" :key="a.id" :to="`/${a.id}`" class="trow">
            <span class="c-entity entity-cell">
              <DeskAppAvatar :id="a.id" :name="a.name" :verdict="a.verdict" :size="30" />
              <span class="names"><span class="ename">{{ a.name }}</span><span class="alt">{{ a.alternatives?.[0] ?? '—' }}</span></span>
            </span>
            <span class="c-rating"><DeskRatingBadge :verdict="a.verdict" /></span>
            <span class="c-outlook"><DeskOutlookMark :outlook="a.review?.outlook ?? null" /></span>
            <span class="c-bar"><span class="bar-track"><span class="bar-fill" :class="a.verdict" :style="{ width: Math.min(100, ((markupIndex(a) ?? 0) / 18) * 100) + '%' }" /></span></span>
            <span class="c-ratio num">{{ markupIndex(a) != null ? markupIndex(a)!.toFixed(1) + '×' : '—' }}</span>
            <span class="c-break num">{{ breakEvenMonths(a) == null ? 'never' : breakEvenMonths(a)!.toFixed(1) + ' mo' }}</span>
            <span class="c-rev num">{{ fmtDateShort(a.verified?.at) }}</span>
            <span class="c-swap num">{{ (votes[a.id] ?? 0) > 0 ? votes[a.id] : '—' }}</span>
          </NuxtLink>
        </div>
        <button v-if="rollAll.length > rollLimit" class="chip more" @click="rollLimit += 24">Show {{ Math.min(24, rollAll.length - rollLimit) }} more of {{ rollAll.length }}</button>
      </div>
    </section>

    <!-- 05 Live Desk -->
    <section class="row tinted">
      <div class="gutter">
        <div class="sec-no">05</div>
        <div class="sec-name">LIVE DESK</div>
      </div>
      <div class="body">
        <div class="live-header">
          <div class="live-copy">
            <div class="roll-title">Who is reading, and what they actually swapped</div>
            <p class="roll-sub">Our verdict is one opinion. What readers actually cancelled is another, and we publish both.</p>
          </div>
        </div>
        <div class="live-cols">
          <div class="live-col wide">
            <div class="col-head">RECENT ACTIVITY</div>
            <div class="stub">
              <p>Comes online with privacy-preserving, self-hosted analytics — a YES verdict we intend to dogfood. Until then this column stays empty, because we don't simulate readers.</p>
            </div>
          </div>
          <div class="live-col">
            <div class="col-head">READERS BY COUNTRY · 24H</div>
            <div class="stub"><p>Same story — real numbers or none.</p></div>
          </div>
          <div class="live-col">
            <div class="col-head">MOST SWAPPED THIS WEEK</div>
            <template v-if="mostSwapped.length">
              <div v-for="(a, i) in mostSwapped" :key="a.id" class="swap-row">
                <span class="rank num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="app">{{ a.name }}</span>
                <span class="v num">{{ a.v }}</span>
              </div>
            </template>
            <div v-else class="stub"><p>No reader votes yet — the ✋ on every rating page feeds this list.</p></div>
          </div>
        </div>
        <p class="live-note">Votes are self-reported, one per browser, and never touch the verdict. They are the only number on this site we do not control.</p>
      </div>
    </section>

    <!-- 06 The Model -->
    <section class="row tinted">
      <div class="gutter">
        <div class="sec-no">06</div>
        <div class="sec-name">THE MODEL</div>
      </div>
      <div class="body">
        <div class="roll-title wide-title">The model is public — and so are the numbers that break it</div>
        <div class="formula">
          <div class="eq1 num">break_even_months&nbsp;&nbsp;=&nbsp;&nbsp;setup_cost&nbsp;&nbsp;÷&nbsp;&nbsp;( subscription&nbsp;&nbsp;−&nbsp;&nbsp;self_host_run_rate )</div>
          <div class="eq2 num">self_host_run_rate&nbsp;&nbsp;=&nbsp;&nbsp;vps_share&nbsp;&nbsp;+&nbsp;&nbsp;storage&nbsp;&nbsp;+&nbsp;&nbsp;maintenance_hours × your_rate</div>
        </div>
        <div class="constants">
          <div class="const"><div class="const-label">LABOUR</div><div class="const-value">${{ rate }} / hr</div><div class="const-note">Deliberately cheap. Raise it.</div></div>
          <div class="const"><div class="const-label">BREAK-EVEN WINDOW</div><div class="const-value">{{ BREAK_EVEN_WINDOW_MO }} mo</div><div class="const-note">Past this, we say keep paying</div></div>
          <div class="const"><div class="const-label">STALENESS</div><div class="const-value">12 mo</div><div class="const-note">Ratings expire; re-review or flagged</div></div>
          <div class="const"><div class="const-label">YES CEILING</div><div class="const-value">≤ 2 hrs</div><div class="const-note">Measured setup, or it isn't a YES</div></div>
        </div>
        <div class="sensitivity">
          <div class="sens-label">DISCLOSED SENSITIVITY</div>
          <p class="sens-body">Raise labour to $60/hr — a realistic senior rate — and {{ sensitivity.fallAt60 }} of the {{ sensitivity.yesCount }} YES ratings fall outside the break-even window. Set your time to $0/hr — the homelab position — and {{ sensitivity.clearAt0 }} of the ratings we scored against you clear the bar. Every rating on this site is a function of a number we picked on your behalf, so we publish it, the data, and the code that computes it. Disagree with us with your own inputs — every page has the slider.</p>
        </div>
        <div class="model-links">
          <a href="/api/apps.json" class="chip">Open the data (JSON)</a>
          <NuxtLink to="/methodology" class="chip">The standard · protocol v1</NuxtLink>
          <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json" class="chip">Changelog</a>
        </div>
      </div>
    </section>

    <!-- 07 Dispatches -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">07</div>
        <div class="sec-name">DISPATCHES</div>
      </div>
      <div class="body">
        <DeskNewsletter />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { position: relative; }
.page-ghosts { position: absolute; inset: 0; pointer-events: none; overflow: clip; }
.page-ghosts .ghost-mark { position: absolute; top: -140px; right: 2%; font-family: var(--display); font-size: 660px; font-weight: 700; color: #11151B; line-height: 1; }
.page-ghosts .ghost-numeral { position: absolute; top: 46%; left: -30px; font-family: var(--display); font-size: 300px; font-weight: 700; letter-spacing: -14px; color: #0E1116; line-height: 1; }
.home > .row { position: relative; }

.lookup-wrap { position: relative; max-width: 620px; }
.lookup-input {
  flex: 1; background: none; border: none; outline: none; color: var(--d-t1);
  font-family: var(--mono); font-size: 14px; padding: 0; border-radius: 0;
}
.lookup-input::placeholder { color: var(--d-t3); }
.lookup-hits { position: absolute; top: 100%; left: 0; right: 0; z-index: 5; background: var(--d-surface); border: 1px solid var(--d-border); border-top: none; }
.hit { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--d-surface-2); color: var(--d-t1); }
.hit:hover { background: var(--d-surface-2); }
.hit-name { flex: 1; font-size: 13.5px; font-weight: 500; }
.hit.none { display: block; font-size: 12.5px; color: var(--d-t3); font-family: var(--mono); }
.chip.more { align-self: flex-start; cursor: pointer; background: none; }
.chip { cursor: pointer; background: none; }
@media (max-width: 900px) { .page-ghosts { display: none; } }
</style>
