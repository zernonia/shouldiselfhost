<script setup lang="ts">
// Per-app rating page, desk-style: entity header + Self-Hosting Facts panel
// (Facts Panel frame) + rationale, evidence, alternatives, history.
const route = useRoute()
const { data, error } = await useFetch(`/api/data/app/${route.params.saas}`)
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not rated yet', fatal: true })
}
const app = computed(() => data.value!.app)
const alts = computed(() => data.value!.alternatives ?? [])

const tierLabel: Record<string, string> = {
  pi: 'a Raspberry Pi', 'old-laptop': 'the old laptop in your closet', vps: 'a real VPS (2 GB+)',
}
const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - +new Date(iso)) / 86400000) : null)
const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '—'

useHead({ title: () => `Should I self-host ${app.value?.name}?` })
useSeoMeta({
  description: () => app.value?.verdict_reason ?? `Should you self-host a replacement for ${app.value?.name}? The math, the verdict, the tested compose file.`,
  ogTitle: () => `Should I self-host ${app.value?.name}?`,
  ogImage: () => `https://shouldiselfhost.com/og/${app.value?.id}.png`,
  ogImageWidth: 1200, ogImageHeight: 630, twitterCard: 'summary_large_image',
})
</script>

<template>
  <article v-if="app">
    <!-- Entity hero -->
    <section class="row hero-row">
      <div class="gutter">
        <div class="sec-no">§</div>
        <div class="sec-name">{{ (app.category ?? 'RATING').toUpperCase() }}</div>
      </div>
      <div class="body">
        <div class="entity-row">
          <div class="entity">
            <DeskAppAvatar :id="app.id" :name="app.name" :verdict="app.verdict" :size="44" />
            <div class="names">
              <h1 class="entity-h1">Should I self-host {{ app.name }}?</h1>
              <div class="entity-meta">${{ app.price_usd_mo }}/mo · {{ app.price_plan }}<template v-if="app.price_unit === 'per-seat'"> per seat</template> · alternative: {{ alts[0]?.name ?? app.alternatives?.[0] }}</div>
            </div>
          </div>
          <div class="marks">
            <div class="mark-block">
              <div class="mark-label">RATING</div>
              <DeskRatingTag :verdict="app.verdict" />
            </div>
            <div class="mark-block">
              <div class="mark-label">OUTLOOK</div>
              <DeskOutlookMark :outlook="app.review?.outlook ?? null" />
            </div>
            <VoteButton :app-id="app.id" />
          </div>
        </div>
        <div class="rule-h" />
        <div class="hero-split-2">
          <div class="rationale">
            <div class="micro-label">RATIONALE</div>
            <p v-for="(p, i) in app.review?.rationale ?? [app.verdict_reason]" :key="i" class="rationale-p">{{ p }}</p>
            <template v-if="app.review?.conditions?.length">
              <div class="rule-h" />
              <div class="micro-label change">WHAT WOULD CHANGE OUR MIND</div>
              <div v-for="(c, i) in app.review.conditions" :key="c" class="condition">
                <span class="idx num">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ c }}</p>
              </div>
            </template>
            <template v-if="app.what_you_lose?.length">
              <div class="rule-h" />
              <div class="micro-label loss">WHAT YOU LOSE</div>
              <div v-for="(l, i) in app.what_you_lose" :key="l" class="condition">
                <span class="idx num loss-idx">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ l }}</p>
              </div>
            </template>
            <template v-if="app.jobs?.length">
              <div class="rule-h" />
              <div class="micro-label">WHAT YOU'RE PAYING FOR</div>
              <p class="jobs num">{{ app.jobs.join(' · ') }}</p>
            </template>
          </div>
          <div class="panel-col">
            <FactsPanel v-if="app.economics" :app="app" />
            <p v-if="app.hardware_tier" class="tier-note">Runs comfortably on <strong>{{ tierLabel[app.hardware_tier] }}</strong>.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Alternatives -->
    <section class="row">
      <div class="gutter">
        <div class="sec-no">01</div>
        <div class="sec-name">ALTERNATIVES</div>
      </div>
      <div class="body">
        <div class="roll-title">Ranked alternatives</div>
        <div class="alt-rows">
          <div v-for="(alt, i) in alts" :key="alt.id" class="alt-row">
            <span class="rank num">{{ String(i + 1).padStart(2, '0') }}</span>
            <ToolLogo :id="alt.id" :name="alt.name" :size="34" />
            <div class="alt-names">
              <NuxtLink :to="`/app/${alt.id}`" class="alt-name">{{ alt.name }}</NuxtLink>
              <span v-if="alt.tagline" class="alt-tag">{{ alt.tagline }}</span>
            </div>
            <div class="alt-meta num">
              <a :href="`https://github.com/${alt.repo}`">{{ alt.repo }}</a>
              <template v-if="alt.metrics?.stars"> · ★ {{ alt.metrics.stars.toLocaleString() }}</template>
              <template v-if="alt.metrics?.last_commit"> · {{ daysSince(alt.metrics.last_commit) }}d</template>
              <span v-if="alt.metrics && daysSince(alt.metrics.last_commit) != null && daysSince(alt.metrics.last_commit)! > 365" class="warn"> · ⚠ UNMAINTAINED</span>
            </div>
          </div>
        </div>
        <UiShot v-if="alts[0]" :id="alts[0].id" :name="alts[0].name" />
      </div>
    </section>

    <!-- Evidence -->
    <section v-if="data!.compose || app.verified" class="row tinted">
      <div class="gutter">
        <div class="sec-no">02</div>
        <div class="sec-name">EVIDENCE</div>
      </div>
      <div class="body">
        <template v-if="app.verified">
          <div class="review-meta wide">
            <div><div class="meta-label">PROTOCOL</div><div class="meta-value num">{{ app.verified.protocol }}</div></div>
            <div><div class="meta-label">VERIFIED BY</div><div class="meta-value num">{{ app.verified.by }}</div></div>
            <div><div class="meta-label">REVIEWED</div><div class="meta-value num">{{ fmtDate(app.verified.at) }}</div></div>
            <div><div class="meta-label">SETUP MEASURED</div><div class="meta-value num">{{ app.verified.setup_min }} MIN</div></div>
            <div v-if="app.verified.assistant"><div class="meta-label">AI ASSISTANT</div><div class="meta-value num">{{ app.verified.assistant.toUpperCase() }} · STATED</div></div>
          </div>
          <template v-if="app.verified.what_broke?.length">
            <div class="micro-label">WHAT BROKE</div>
            <div v-for="(w, i) in app.verified.what_broke" :key="w" class="condition">
              <span class="idx num">{{ String(i + 1).padStart(2, '0') }}</span>
              <p>{{ w }}</p>
            </div>
          </template>
        </template>
        <template v-if="data!.compose">
          <div class="micro-label">THE TESTED COMPOSE FILE — CI-BOOTED WEEKLY</div>
          <pre class="compose num">{{ data!.compose }}</pre>
          <p v-if="app.links?.caniselfhostit" class="cross-note">Want a guided install instead? <a :href="app.links.caniselfhostit">caniselfhostit.com/{{ app.id }}</a> has AI-agent prompts that assume a bare machine — that's their half of the stool, and it's good.</p>
        </template>
        <details v-if="data!.log" class="log-details">
          <summary class="micro-label">FULL TIMED LOG</summary>
          <pre class="compose num">{{ data!.log }}</pre>
        </details>
      </div>
    </section>

    <!-- History -->
    <section v-if="data!.changelog?.length" class="row">
      <div class="gutter">
        <div class="sec-no">03</div>
        <div class="sec-name">HISTORY</div>
      </div>
      <div class="body">
        <div class="hist-rows">
          <div v-for="c in data!.changelog" :key="c.date + c.to" class="hist-row">
            <span class="hist-date num">{{ fmtDate(c.date) }}</span>
            <span class="hist-move num">{{ c.from ?? 'UNRATED' }} → {{ c.to }}</span>
            <span class="hist-reason">{{ c.reason }}</span>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.hero-row { padding-top: 54px; }
.entity-h1 { font-family: var(--display); font-size: clamp(24px, 3vw, 38px); font-weight: 500; letter-spacing: -1.4px; line-height: 1.1; margin: 0; color: var(--d-t1); }
.hero-split-2 { display: flex; gap: 48px; align-items: flex-start; }
.rationale-p { font-size: 14.5px; line-height: 1.72; color: var(--d-t2); margin: 0; }
.panel-col { flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; width: min(520px, 100%); }
.tier-note { font-size: 12.5px; color: var(--d-t3); margin: 0; }
.tier-note strong { color: var(--d-t2); }
.micro-label.loss { color: var(--no); }
.loss-idx { color: var(--no) !important; }
.jobs { font-size: 12px; color: var(--d-t3); line-height: 1.8; margin: 0; }

.alt-rows { display: flex; flex-direction: column; }
.alt-row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid var(--d-surface-2); }
.alt-row .rank { font-family: var(--mono); font-size: 11.5px; color: var(--d-faint); }
.alt-names { display: flex; flex-direction: column; gap: 2px; min-width: 200px; }
.alt-name { font-size: 14.5px; font-weight: 600; color: var(--d-t1); }
.alt-name:hover { color: var(--yes); }
.alt-tag { font-size: 12px; color: var(--d-t3); }
.alt-meta { flex: 1; text-align: right; font-size: 11.5px; color: var(--d-t3); }
.alt-meta a { color: var(--d-t2); }
.warn { color: var(--no); }

.review-meta.wide { display: flex; gap: 40px; flex-wrap: wrap; }
.compose { background: var(--d-surface); border: 1px solid var(--d-border); border-radius: 0; padding: 18px 20px; font-size: 12px; line-height: 1.6; overflow-x: auto; color: var(--d-t2); }
.cross-note { font-size: 12.5px; color: var(--d-t3); margin: 0; }
.log-details summary { cursor: pointer; }
.hist-rows { display: flex; flex-direction: column; }
.hist-row { display: flex; gap: 22px; padding: 11px 0; border-bottom: 1px solid var(--d-surface-2); font-size: 12.5px; align-items: baseline; }
.hist-date { color: var(--d-t3); width: 100px; flex-shrink: 0; }
.hist-move { color: var(--d-t1); font-weight: 600; width: 190px; flex-shrink: 0; }
.hist-reason { color: var(--d-t2); font-style: italic; }
@media (max-width: 1000px) {
  .hero-split-2 { flex-direction: column; }
  .panel-col { width: 100%; }
}
</style>
