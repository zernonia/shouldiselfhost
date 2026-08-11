<script setup lang="ts">
// The Rating Desk — editorial dossier page, built from frame UJL2k
// ("shouldiselfhost — Rating Action") in untitled.pen. Geometry, type and color
// values are read from the document; every figure on the page is either derived
// from data/ via shared/derive.mjs or an authored `review` block — the design's
// invented numbers (live activity, country counts, model constants that aren't
// ours) are stubbed or replaced with the real model, never shipped as fact.
import {
  selfHostCostUsdMo, netMonthlySavingUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE, BREAK_EVEN_WINDOW_MO,
} from '#shared/derive.mjs'

definePageMeta({ layout: 'bare' })

const { data } = await useFetch('/api/data/apps')
const apps = computed<any[]>(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a) => a.verdict))
const counts = computed(() => ({
  yes: scored.value.filter((a) => a.verdict === 'YES').length,
  kinda: scored.value.filter((a) => a.verdict === 'KINDA').length,
  no: scored.value.filter((a) => a.verdict === 'NOT_REALLY').length,
}))

// Featured rating action = the app carrying an authored review block.
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

// Ticker + roll: most recently reviewed first.
const byReviewed = computed(() =>
  [...scored.value].sort((a, b) =>
    String(b.verified?.at ?? '').localeCompare(String(a.verified?.at ?? '')) ||
    (markupIndex(b) ?? 0) - (markupIndex(a) ?? 0)))
const ticker = computed(() => byReviewed.value.slice(0, 9))
const roll = computed(() => byReviewed.value.slice(0, 8))

// Odometer — Σ prices of YES verdicts ("spend we say you can stop"), and the honest half.
const stopSum = computed(() => scored.value.filter((a) => a.verdict === 'YES').reduce((s, a) => s + a.price_usd_mo, 0))
const staySum = computed(() => scored.value.filter((a) => a.verdict === 'NOT_REALLY').reduce((s, a) => s + a.price_usd_mo, 0))
const odoChars = computed(() => Math.round(stopSum.value).toLocaleString('en-US').split(''))

// The model, for the featured app — real derive.mjs numbers at the reference rate.
const rate = DEFAULT_HOURLY_RATE
const model = computed(() => {
  const a = featured.value
  if (!a?.economics) return null
  const maint = (a.economics.maint_min_mo / 60) * rate
  return {
    sub: a.price_usd_mo,
    vps: a.economics.vps_share_usd_mo,
    storage: a.economics.storage_usd_mo ?? 0,
    maintMin: a.economics.maint_min_mo,
    maint,
    allIn: selfHostCostUsdMo(a.economics, rate),
    markup: markupIndex(a, rate),
    breakEven: breakEvenMonths(a, rate),
  }
})

// Disclosed sensitivity — computed live from the data, not asserted.
const sensitivity = computed(() => {
  const yes = scored.value.filter((a) => a.verdict === 'YES' && a.economics)
  const fallAt60 = yes.filter((a) => {
    const be = breakEvenMonths(a, 60)
    return be == null || be > BREAK_EVEN_WINDOW_MO
  }).length
  const others = scored.value.filter((a) => a.verdict !== 'YES' && a.economics)
  const clearAt0 = others.filter((a) => {
    const be = breakEvenMonths(a, 0)
    const saving = netMonthlySavingUsd(a, 0)
    return saving != null && saving > 0 && be != null && be <= BREAK_EVEN_WINDOW_MO
  }).length
  return { yesCount: yes.length, fallAt60, clearAt0 }
})

// Browse chips — real category counts.
const catChips = computed(() => {
  const m = new Map<string, number>()
  for (const a of scored.value) m.set(a.category ?? 'other', (m.get(a.category ?? 'other') ?? 0) + 1)
  return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 7)
})
const altCount = computed(() => new Set(apps.value.flatMap((a) => a.alternatives ?? [])).size)

// Reader votes — the only number on this site we do not control. Hydrates live.
const votes = ref<Record<string, number>>({})
onMounted(async () => {
  try { votes.value = (await $fetch<{ votes: Record<string, number> }>('/api/votes')).votes } catch {}
})
const mostSwapped = computed(() =>
  [...scored.value]
    .map((a) => ({ ...a, v: votes.value[a.id] ?? 0 }))
    .filter((a) => a.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 5))

const scaleMeta = [
  { key: 'YES', count: () => counts.value.yes, def: 'Self-host it. The alternative is credible, the migration is survivable, and the maths is not close.', examples: 'Plausible · Uptime Kuma · Stirling PDF · Grist' },
  { key: 'KINDA', count: () => counts.value.kinda, def: 'Only if the box already exists. On a machine you run anyway the case is fine; standing one up for this is not.', examples: 'Notion · Dropbox · Figma · Trello' },
  { key: 'NOT_REALLY', count: () => counts.value.no, def: 'Keep paying. The alternative exists and still loses once your hours and the cost of it being down are priced.', examples: '1Password · Copilot · Lightroom · Zoom' },
] as const

useHead({ title: () => `The Rating Desk — Issue ${issueNo.value}` })
useSeoMeta({ description: () => `Rating action #${issueNo.value}: ${featured.value?.name} ${featured.value?.review?.action ?? 'reviewed'} at ${featured.value?.verdict}. ${scored.value.length} apps under coverage.` })
</script>

<template>
  <div class="desk num-page">
    <!-- Backdrop: glows, ghost marks, column rules (design: Backdrop frame) -->
    <div class="backdrop" aria-hidden="true">
      <div class="glow glow-hero" />
      <div class="glow glow-lower" />
      <div class="ghost-mark">?</div>
      <div class="ghost-numeral">{{ issueNo }}</div>
      <div class="gridline g1" /><div class="gridline g2" /><div class="gridline g3" /><div class="gridline g4" />
    </div>

    <!-- Masthead -->
    <header class="masthead">
      <div class="masthead-row">
        <div class="brand-row">
          <NuxtLink to="/" class="logo">shouldiselfhost<span class="q">?</span></NuxtLink>
          <span class="rule-v" />
          <span class="strapline">they tell you if you can — we tell you if you should</span>
        </div>
        <div class="masthead-meta">
          <span>ISSUE {{ issueNo }}</span>
          <span class="sep">·</span>
          <span>{{ fmtDate(featured?.verified?.at) }}</span>
          <NuxtLink to="/" class="search-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <span>Look up a rating</span>
          </NuxtLink>
        </div>
      </div>
      <div class="running-head">
        <span>THE DECISION LAYER FOR SELF-HOSTING</span>
        <span>{{ apps.length }} APPS UNDER COVERAGE</span>
        <span>PROTOCOL v1</span>
        <span>NO VENDOR HAS EVER PAID FOR A RATING</span>
      </div>
      <div class="ticker">
        <span class="ticker-lead"><span class="live-dot" />RECENT ACTIONS</span>
        <template v-for="(t, i) in ticker" :key="t.id">
          <span v-if="i" class="sep">·</span>
          <NuxtLink :to="`/${t.id}`" class="tick">
            <span class="tick-mark" :class="t.verdict" />
            <span class="tick-app">{{ t.name.toUpperCase() }}</span>
            <span class="tick-grade" :class="t.verdict">{{ t.verdict === 'NOT_REALLY' ? 'NOT REALLY' : t.verdict }}</span>
          </NuxtLink>
        </template>
      </div>
    </header>

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
            <NuxtLink to="/" class="lookup">
              <span class="prompt">&gt;</span>
              <span class="ph">type an app…</span>
              <span class="caret" />
              <span class="count">{{ scored.length }} rated</span>
            </NuxtLink>
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

    <!-- 04 Browse -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">04</div>
        <div class="sec-name">BROWSE</div>
      </div>
      <div class="body">
        <div class="chips">
          <NuxtLink to="/" class="chip active">all <span class="chip-count">{{ scored.length }}</span></NuxtLink>
          <NuxtLink v-for="[cat, n] in catChips" :key="cat" to="/" class="chip">{{ cat }} <span class="chip-count">{{ n }}</span></NuxtLink>
        </div>
        <div class="escape-hatch">
          <div class="escape-copy">
            <span class="escape-count">{{ altCount }} open-source alternatives</span>
            <span class="escape-body">across the {{ scored.length }} rated apps — even behind a NOT REALLY.</span>
          </div>
          <NuxtLink to="/" class="escape-link">browse them
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 05 Coverage Roll -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">05</div>
        <div class="sec-name">COVERAGE</div>
      </div>
      <div class="body">
        <div class="roll-header">
          <div class="roll-copy">
            <div class="roll-title">The roll, most recently reviewed first</div>
            <p class="roll-sub">Every rating carries a review date. A rating older than twelve months is marked stale and excluded from the headline counts.</p>
          </div>
          <NuxtLink to="/" class="view-all">All {{ scored.length }} ratings
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </NuxtLink>
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
      </div>
    </section>

    <!-- 06 Live Desk -->
    <section class="row tinted">
      <div class="gutter">
        <div class="sec-no">06</div>
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
            <!-- Stub, deliberately: no analytics run on this site yet. We do not simulate readers. -->
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

    <!-- 07 The Model -->
    <section class="row tinted">
      <div class="gutter">
        <div class="sec-no">07</div>
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
          <a href="/api/apps.json" class="chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18M3 6h18M3 18h18" /></svg>
            Open the data (JSON)</a>
          <NuxtLink to="/methodology" class="chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
            Rubric · protocol v1</NuxtLink>
          <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json" class="chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3" /><path d="M3 12h6m6 0h6" /></svg>
            Changelog</a>
        </div>
      </div>
    </section>

    <!-- Colophon -->
    <footer class="colophon">
      <div class="colophon-top">
        <div class="colophon-brand">
          <div class="logo">shouldiselfhost<span class="q">?</span></div>
          <p>An independent ratings desk for self-hosted software. Ratings are opinions about cost, not advice about your infrastructure — and certainly not about your weekends.</p>
        </div>
        <div class="colophon-links">
          <div class="col">
            <div class="col-head">RATINGS</div>
            <NuxtLink to="/">The roll</NuxtLink>
            <NuxtLink to="/desk">Rating actions</NuxtLink>
            <NuxtLink to="/vs">Head-to-head</NuxtLink>
          </div>
          <div class="col">
            <div class="col-head">METHOD</div>
            <NuxtLink to="/methodology">Rubric · protocol v1</NuxtLink>
            <a href="/api/apps.json">The data (JSON)</a>
            <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json">Changelog</a>
          </div>
          <div class="col">
            <div class="col-head">DESK</div>
            <a href="https://github.com/zernonia/shouldiselfhost/issues/new">Request a review</a>
            <a href="https://github.com/zernonia/shouldiselfhost/issues/new">File an appeal</a>
            <a href="https://github.com/zernonia/shouldiselfhost/issues/new">Corrections</a>
          </div>
        </div>
      </div>
      <div class="rule-h" />
      <div class="appeals">
        <span class="appeals-label">APPEALS</span>
        <p>No vendor has ever paid for a rating and none ever will. A vendor who believes a rating is wrong may file for re-review with their own figures; we publish the outcome either way, including the times we were wrong.</p>
      </div>
      <div class="colophon-bottom">
        <span>Ratings data CC BY-SA 4.0 · site code AGPL-3.0</span>
        <span>they tell you if you can — we tell you if you should</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Tokens from the document's variable table (bg/surface/border/text-n match the
   site palette; page-local names keep the mapping explicit). */
.desk {
  --d-bg: #08090B; --d-surface: #101216; --d-surface-2: #15181D; --d-border: #1F232A;
  --d-t1: #F2F3F5; --d-t2: #9AA0AB; --d-t3: #5C616B; --d-faint: #3A3F48; --d-dim: #2A2E36;
  position: relative;
  background: var(--d-bg);
  margin: 0 calc(50% - 50vw);
  font-family: var(--sans);
  color: var(--d-t1);
  overflow: clip;
}
.desk > * { position: relative; }

/* Backdrop */
.backdrop { position: absolute; inset: 0; pointer-events: none; }
.glow { position: absolute; border-radius: 50%; }
.glow-hero { width: 1240px; height: 1020px; top: -380px; left: 50%; transform: translateX(-50%); background: radial-gradient(closest-side, #34D3991F, #34D39900); }
.glow-lower { width: 1100px; height: 900px; bottom: -200px; right: -300px; background: radial-gradient(closest-side, #FB718514, #FB718500); }
.ghost-mark { position: absolute; top: -40px; right: 2%; font-family: var(--display); font-size: 660px; font-weight: 700; color: #11151B; line-height: 1; }
.ghost-numeral { position: absolute; top: 46%; left: -30px; font-family: var(--display); font-size: 300px; font-weight: 700; letter-spacing: -14px; color: #0E1116; line-height: 1; }
.gridline { position: absolute; top: 0; bottom: 0; width: 1px; }
.g1 { left: 64px; background: #1C212A; } .g2 { left: 174px; background: #12161C; }
.g3 { left: 216px; background: #1C212A; } .g4 { right: 64px; background: #1A1F27; }

/* Masthead */
.masthead { border-bottom: 1px solid var(--d-border); }
.masthead-row { display: flex; justify-content: space-between; align-items: center; gap: 40px; padding: 19px 64px; border-bottom: 1px solid var(--d-border); flex-wrap: wrap; }
.brand-row { display: flex; align-items: center; gap: 16px; }
.logo { font-family: var(--mono); font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: var(--d-t1); }
.logo .q { color: var(--yes); }
.rule-v { width: 1px; height: 15px; background: var(--d-border); }
.strapline { font-family: var(--mono); font-size: 11px; color: var(--d-t3); }
.masthead-meta { display: flex; align-items: center; gap: 18px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.8px; color: var(--d-t3); }
.sep { color: var(--d-dim); }
.search-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px; border: 1px solid var(--d-border); border-radius: 7px; color: var(--d-t2); font-size: 11.5px; letter-spacing: 0; }
.search-chip svg { color: var(--d-t3); }
.running-head { display: flex; justify-content: space-between; gap: 30px; padding: 9px 64px; background: #0B0C0FB3; border-bottom: 1px solid var(--d-border); font-family: var(--mono); font-size: 10px; letter-spacing: 1.3px; color: var(--d-t3); flex-wrap: wrap; }
.ticker { display: flex; align-items: center; padding: 11px 64px; background: #0B0C0FB3; font-family: var(--mono); overflow-x: auto; scrollbar-width: none; }
.ticker-lead { display: inline-flex; align-items: center; gap: 8px; padding-right: 20px; font-size: 10px; font-weight: 600; letter-spacing: 1.3px; color: var(--d-t2); white-space: nowrap; }
.live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--yes); }
.tick { display: inline-flex; align-items: center; gap: 7px; padding: 0 13px; white-space: nowrap; }
.tick-mark { width: 5px; height: 5px; }
.tick-mark.YES { background: var(--yes); } .tick-mark.KINDA { background: var(--kinda); } .tick-mark.NOT_REALLY { background: var(--no); }
.tick-app { color: var(--d-t2); font-size: 10px; letter-spacing: 0.9px; }
.tick-grade { font-size: 10px; letter-spacing: 0.9px; }
.tick-grade.YES { color: var(--yes); } .tick-grade.KINDA { color: var(--kinda); } .tick-grade.NOT_REALLY { color: var(--no); }

/* Section scaffold */
.row { display: flex; gap: 42px; padding: 66px 64px; border-bottom: 1px solid var(--d-border); }
.row.tinted { background: #0B0C0FB3; }
.gutter { width: 110px; flex-shrink: 0; display: flex; flex-direction: column; gap: 7px; }
.sec-no { font-family: var(--mono); font-size: 15px; font-weight: 700; letter-spacing: 0.4px; color: var(--yes); }
.sec-name { font-family: var(--mono); font-size: 10px; letter-spacing: 1.3px; color: var(--d-t3); }
.sec-sub { font-family: var(--mono); font-size: 10px; letter-spacing: 1.3px; color: var(--d-dim); }
.gutter-rule { font-family: var(--mono); font-size: 12px; color: var(--d-dim); }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 34px; }
.micro-label { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; color: var(--d-t3); }

/* 01 Abstract */
.headline { font-family: var(--display); font-size: clamp(34px, 4vw, 56px); font-weight: 500; letter-spacing: -2.2px; line-height: 1.05; margin: 0; color: var(--d-t1); }
.dashes { display: inline-flex; gap: 7px; margin: 0 6px; }
.dashes i { width: 28px; height: 6px; background: var(--yes); display: inline-block; }
.abstract-copy { display: flex; flex-direction: column; gap: 30px; max-width: 700px; }
.statement { font-size: 16px; line-height: 1.68; color: var(--d-t2); max-width: 620px; margin: 0; }
.lookup { display: flex; align-items: center; gap: 10px; max-width: 620px; padding: 14px 16px; background: var(--d-surface); border: 1px solid var(--d-border); font-family: var(--mono); }
.prompt { color: var(--yes); font-size: 14px; font-weight: 700; }
.ph { flex: 1; color: var(--d-t3); font-size: 14px; }
.caret { width: 8px; height: 17px; background: var(--yes); animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .caret { animation: none; } }
.count { color: var(--d-dim); font-size: 11.5px; }
.odometer { display: flex; justify-content: space-between; align-items: end; gap: 40px; padding-top: 34px; border-top: 1px solid var(--d-border); flex-wrap: wrap; }
.odo-left, .odo-right { display: flex; flex-direction: column; gap: 13px; }
.odo-right { align-items: flex-end; gap: 9px; }
.digits { display: flex; align-items: center; gap: 8px; }
.glyph { font-family: var(--display); font-size: 30px; font-weight: 700; letter-spacing: -1px; color: var(--d-t3); }
.tile { width: 46px; height: 64px; display: inline-flex; align-items: center; justify-content: center; background: var(--d-surface); border: 1px solid var(--d-border); border-radius: 3px; font-family: var(--display); font-size: 34px; font-weight: 700; letter-spacing: -1px; color: var(--yes); }
.permo { font-family: var(--mono); font-size: 14px; color: var(--d-t3); }
.odo-note { font-family: var(--mono); font-size: 11.5px; color: var(--d-t3); }
.counter-line { font-family: var(--display); font-size: 22px; font-weight: 600; letter-spacing: -0.8px; color: var(--d-t1); }

/* 02 Scale */
.scale-intro { font-size: 15px; line-height: 1.68; color: var(--d-t2); max-width: 820px; margin: 0; }
.scale-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.scale-col { display: flex; flex-direction: column; gap: 16px; padding-top: 20px; border-top: 2px solid; }
.scale-col.YES { border-color: var(--yes); } .scale-col.KINDA { border-color: var(--kinda); } .scale-col.NOT_REALLY { border-color: var(--no); }
.count-row { display: flex; align-items: end; gap: 9px; }
.big-count { font-family: var(--display); font-size: 46px; font-weight: 600; letter-spacing: -2px; line-height: 1; color: var(--d-t1); }
.of { font-family: var(--mono); font-size: 11.5px; color: var(--d-t3); }
.share-track { height: 4px; background: #181B21; }
.share-fill { display: block; height: 100%; }
.share-fill.YES { background: var(--yes); } .share-fill.KINDA { background: var(--kinda); } .share-fill.NOT_REALLY { background: var(--no); }
.definition { font-size: 13.5px; line-height: 1.65; color: var(--d-t2); margin: 0; }
.examples { font-family: var(--mono); font-size: 11.5px; line-height: 1.6; color: var(--d-t3); margin: 0; }

/* 03 Rating Action */
.entity-row { display: flex; justify-content: space-between; align-items: center; gap: 40px; flex-wrap: wrap; }
.entity { display: flex; align-items: center; gap: 14px; }
.entity-name { font-family: var(--display); font-size: 21px; font-weight: 600; letter-spacing: -0.6px; }
.entity-meta { font-family: var(--mono); font-size: 11.5px; color: var(--d-t3); }
.names { display: flex; flex-direction: column; gap: 3px; }
.marks { display: flex; gap: 34px; align-items: center; }
.mark-block { display: flex; flex-direction: column; gap: 7px; }
.mark-label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.3px; color: var(--d-dim); }
.rule-h { height: 1px; background: var(--d-border); }
.action-headline { display: flex; gap: 11px; align-items: center; flex-wrap: wrap; font-family: var(--display); font-size: clamp(22px, 2.4vw, 30px); font-weight: 500; letter-spacing: -1px; }
.action-headline .grade { font-weight: 600; }
.action-headline .grade.YES { color: var(--yes); } .action-headline .grade.KINDA { color: var(--kinda); } .action-headline .grade.NOT_REALLY { color: var(--no); }
.action-split { display: flex; gap: 48px; }
.rationale { flex: 1; min-width: 0; max-width: 660px; display: flex; flex-direction: column; gap: 22px; }
.rationale p { font-size: 14.5px; line-height: 1.72; color: var(--d-t2); margin: 0; }
.micro-label.change { color: var(--yes); letter-spacing: 1.3px; }
.condition { display: flex; gap: 14px; }
.condition .idx { color: var(--yes); font-size: 12px; }
.condition p { font-size: 13.5px; line-height: 1.65; }
.model-col { width: 452px; flex-shrink: 0; padding-left: 28px; border-left: 1px solid var(--d-border); display: flex; flex-direction: column; }
.model-col .micro-label { letter-spacing: 1.3px; margin-bottom: 8px; }
.mrow { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--d-surface-2); font-size: 13px; color: var(--d-t2); }
.mrow.total { border-bottom-color: var(--d-border); color: var(--d-t1); font-weight: 600; }
.mrow .v { font-size: 13.5px; font-weight: 600; }
.mrow .v.strong { color: var(--d-t1); font-size: 14.5px; font-weight: 700; }
.mrow .v.neg { color: var(--no); } .mrow .v.pos { color: var(--yes); }
.model-footer { display: flex; flex-direction: column; gap: 20px; padding-top: 24px; }
.outlook-note { font-size: 12px; line-height: 1.6; color: var(--d-t3); margin: 0; }
.review-meta { display: flex; justify-content: space-between; gap: 20px; }
.meta-label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.2px; color: var(--d-dim); margin-bottom: 5px; }
.meta-value { font-size: 11.5px; color: var(--d-t2); }

/* Pull quote */
.quote-row { padding-block: 86px; }
.pull-quote { font-family: var(--display); font-size: clamp(30px, 4vw, 54px); font-weight: 500; letter-spacing: -2px; line-height: 1.14; }
.pq-no { color: var(--no); }
.quote-note { font-family: var(--mono); font-size: 13px; color: var(--d-t3); margin-top: 26px; }

/* 04 Browse */
.chips { display: flex; gap: 9px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: 6px; border: 1px solid var(--d-border); font-family: var(--mono); font-size: 11.5px; color: var(--d-t2); }
.chip.active { background: var(--yes); border-color: var(--yes); color: var(--d-bg); font-weight: 600; }
.chip.active .chip-count { color: var(--d-bg); }
.chip-count { font-size: 10.5px; color: var(--d-faint); }
.escape-hatch { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 14px 18px; background: #34D3990D; border: 1px solid var(--yes); flex-wrap: wrap; }
.escape-copy { display: flex; gap: 9px; align-items: baseline; flex-wrap: wrap; }
.escape-count { font-family: var(--mono); font-size: 12.5px; font-weight: 700; color: var(--yes); }
.escape-body { font-size: 13.5px; color: var(--d-t2); }
.escape-link { display: inline-flex; align-items: center; gap: 7px; font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--yes); }

/* 05 Coverage Roll */
.roll-header { display: flex; justify-content: space-between; align-items: end; gap: 40px; flex-wrap: wrap; }
.roll-copy { max-width: 700px; display: flex; flex-direction: column; gap: 10px; }
.roll-title { font-family: var(--display); font-size: 28px; font-weight: 500; letter-spacing: -0.9px; color: var(--d-t1); }
.roll-sub { font-size: 14px; line-height: 1.65; color: var(--d-t2); margin: 0; }
.view-all { display: inline-flex; align-items: center; gap: 8px; padding: 10px 15px; border: 1px solid var(--d-border); border-radius: 7px; font-family: var(--mono); font-size: 11.5px; color: var(--d-t2); }
.view-all svg { color: var(--d-t3); }
.roll-table { display: flex; flex-direction: column; overflow-x: auto; }
.thead, .trow { display: flex; gap: 22px; align-items: center; min-width: 900px; }
.thead { padding-bottom: 13px; border-bottom: 1px solid var(--d-border); font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.3px; color: var(--d-faint); }
.trow { padding: 15px 0; border-bottom: 1px solid var(--d-surface-2); color: inherit; }
.trow:hover .ename { color: var(--yes); }
.c-entity { width: 322px; flex-shrink: 0; }
.entity-cell { display: flex; gap: 12px; align-items: center; }
.entity-cell .names { gap: 2px; }
.ename { font-size: 14.5px; font-weight: 600; color: var(--d-t1); transition: color 0.3s var(--ease); }
.alt { font-family: var(--mono); font-size: 11px; color: var(--d-t3); }
.c-rating { width: 120px; flex-shrink: 0; }
.c-outlook { width: 118px; flex-shrink: 0; }
.c-bar { width: 150px; flex-shrink: 0; }
.bar-track { display: block; height: 5px; background: #181B21; }
.bar-fill { display: block; height: 100%; }
.bar-fill.YES { background: var(--yes); } .bar-fill.KINDA { background: var(--kinda); } .bar-fill.NOT_REALLY { background: var(--no); }
.c-ratio { width: 58px; flex-shrink: 0; font-size: 13.5px; font-weight: 700; color: var(--d-t1); }
.c-break { width: 84px; flex-shrink: 0; font-size: 12.5px; color: var(--d-t2); }
.c-rev { width: 78px; flex-shrink: 0; font-size: 12px; color: var(--d-t3); }
.c-swap { width: 70px; flex-shrink: 0; font-size: 13px; font-weight: 700; color: var(--d-t1); }

/* 06 Live Desk */
.live-header { display: flex; justify-content: space-between; align-items: end; gap: 40px; }
.live-cols { display: flex; gap: 40px; flex-wrap: wrap; }
.live-col { width: 280px; display: flex; flex-direction: column; gap: 14px; }
.live-col.wide { width: 480px; }
.col-head { font-family: var(--mono); font-size: 9.5px; font-weight: 600; letter-spacing: 1.3px; color: var(--d-faint); }
.stub { border: 1px dashed var(--d-border); padding: 14px 16px; }
.stub p { font-size: 12.5px; line-height: 1.6; color: var(--d-t3); margin: 0; }
.swap-row { display: flex; gap: 12px; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--d-surface-2); }
.swap-row .rank { font-size: 11.5px; color: var(--d-faint); }
.swap-row .app { flex: 1; font-size: 13px; font-weight: 500; color: var(--d-t1); }
.swap-row .v { font-size: 13px; font-weight: 700; color: var(--yes); }
.live-note { font-family: var(--mono); font-size: 11.5px; color: var(--d-t3); margin: 0; }

/* 07 Model */
.wide-title { max-width: 820px; line-height: 1.25; }
.formula { display: flex; flex-direction: column; gap: 16px; padding: 30px; background: var(--d-surface); border: 1px solid var(--d-border); border-radius: 10px; overflow-x: auto; }
.eq1 { font-size: 17px; font-weight: 600; letter-spacing: -0.2px; color: var(--d-t1); white-space: nowrap; }
.eq2 { font-size: 14px; color: var(--d-t2); white-space: nowrap; }
.constants { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.const { display: flex; flex-direction: column; gap: 9px; padding-top: 18px; border-top: 1px solid var(--d-border); }
.const-label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.3px; color: var(--d-t3); }
.const-value { font-family: var(--display); font-size: 21px; font-weight: 600; letter-spacing: -0.6px; color: var(--d-t1); }
.const-note { font-size: 12.5px; line-height: 1.55; color: var(--d-t3); }
.sensitivity { display: flex; flex-direction: column; gap: 11px; padding: 2px 0 2px 24px; border-left: 2px solid var(--kinda); }
.sens-label { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.3px; color: var(--kinda); }
.sens-body { font-size: 14.5px; line-height: 1.7; color: var(--d-t2); max-width: 880px; margin: 0; }
.model-links { display: flex; gap: 10px; flex-wrap: wrap; }
.model-links .chip svg { color: var(--d-t3); }

/* Colophon */
.colophon { display: flex; flex-direction: column; gap: 36px; padding: 54px 64px 44px; }
.colophon-top { display: flex; justify-content: space-between; gap: 80px; flex-wrap: wrap; }
.colophon-brand { max-width: 460px; display: flex; flex-direction: column; gap: 14px; }
.colophon-brand .logo { font-size: 14px; }
.colophon-brand p { font-size: 13px; line-height: 1.65; color: var(--d-t3); margin: 0; }
.colophon-links { display: flex; gap: 60px; flex-wrap: wrap; }
.colophon-links .col { display: flex; flex-direction: column; gap: 12px; }
.colophon-links .col-head { font-weight: 400; }
.colophon-links a { font-size: 13px; color: var(--d-t2); }
.colophon-links a:hover { color: var(--d-t1); }
.appeals { display: flex; gap: 14px; align-items: baseline; flex-wrap: wrap; }
.appeals-label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.3px; color: var(--yes); }
.appeals p { max-width: 820px; font-size: 13px; line-height: 1.65; color: var(--d-t3); margin: 0; }
.colophon-bottom { display: flex; justify-content: space-between; gap: 40px; font-family: var(--mono); font-size: 11px; color: var(--d-faint); flex-wrap: wrap; }

/* Mobile collapse */
@media (max-width: 900px) {
  .row { flex-direction: column; gap: 20px; padding: 44px 20px; }
  .gutter { flex-direction: row; align-items: baseline; width: auto; }
  .masthead-row, .running-head, .ticker { padding-inline: 20px; }
  .scale-cols, .constants { grid-template-columns: 1fr; }
  .action-split { flex-direction: column; }
  .model-col { width: 100%; padding-left: 0; border-left: none; border-top: 1px solid var(--d-border); padding-top: 20px; }
  .colophon { padding: 40px 20px; }
  .ghost-mark, .ghost-numeral { display: none; }
}
</style>
