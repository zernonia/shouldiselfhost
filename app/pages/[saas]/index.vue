<script setup lang="ts">
// Per-app rating page, desk-style, pure Tailwind: entity header +
// Self-Hosting Facts panel + rationale, evidence, alternatives, history.
import { dk } from '~/composables/deskClasses'

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

const markLabel = 'font-mono text-[9.5px] tracking-[1.3px] text-dim'
const pre = 'overflow-x-auto border border-line bg-surface px-5 py-[18px] font-mono text-[12px] leading-[1.6] text-t2'

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
    <section :class="dk.row" class="pt-[54px]!">
      <div :class="dk.gutter">
        <div :class="dk.secNo">§</div>
        <div :class="dk.secName">{{ (app.category ?? 'RATING').toUpperCase() }}</div>
      </div>
      <div :class="dk.body">
        <div class="flex flex-wrap items-center justify-between gap-10">
          <div class="flex items-center gap-[14px]">
            <DeskAppAvatar :id="app.id" :name="app.name" :verdict="app.verdict" :size="44" />
            <div class="flex flex-col gap-[3px]">
              <h1 class="m-0 font-display text-[clamp(24px,3vw,38px)] font-medium leading-[1.1] tracking-[-1.4px] text-t1">Should I self-host {{ app.name }}?</h1>
              <div class="font-mono text-[11.5px] text-t3">${{ app.price_usd_mo }}/mo · {{ app.price_plan }}<template v-if="app.price_unit === 'per-seat'"> per seat</template> · alternative: {{ alts[0]?.name ?? app.alternatives?.[0] }}</div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-[34px]">
            <div class="flex flex-col gap-[7px]">
              <div :class="markLabel">RATING</div>
              <DeskRatingTag :verdict="app.verdict" />
            </div>
            <div class="flex flex-col gap-[7px]">
              <div :class="markLabel">OUTLOOK</div>
              <DeskOutlookMark :outlook="app.review?.outlook ?? null" />
            </div>
            <VoteButton :app-id="app.id" />
          </div>
        </div>
        <div :class="dk.ruleH" />
        <div class="flex items-start gap-12 max-[1000px]:flex-col">
          <div class="flex min-w-0 max-w-[660px] flex-1 flex-col gap-[22px]">
            <div :class="dk.microLabel">RATIONALE</div>
            <p v-for="(p, i) in app.review?.rationale ?? [app.verdict_reason]" :key="i" class="m-0 text-[14.5px] leading-[1.72] text-t2">{{ p }}</p>
            <template v-if="app.review?.conditions?.length">
              <div :class="dk.ruleH" />
              <div :class="dk.microLabel" class="text-yes!">WHAT WOULD CHANGE OUR MIND</div>
              <div v-for="(c, i) in app.review.conditions" :key="c" :class="dk.condition">
                <span :class="dk.conditionIdx">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ c }}</p>
              </div>
            </template>
            <template v-if="app.what_you_lose?.length">
              <div :class="dk.ruleH" />
              <div :class="dk.microLabel" class="text-no!">WHAT YOU LOSE</div>
              <div v-for="(l, i) in app.what_you_lose" :key="l" :class="dk.condition">
                <span :class="dk.conditionIdx" class="text-no!">{{ String(i + 1).padStart(2, '0') }}</span>
                <p>{{ l }}</p>
              </div>
            </template>
            <template v-if="app.jobs?.length">
              <div :class="dk.ruleH" />
              <div :class="dk.microLabel">WHAT YOU'RE PAYING FOR</div>
              <p class="m-0 font-mono text-[12px] leading-[1.8] text-t3">{{ app.jobs.join(' · ') }}</p>
            </template>
          </div>
          <div class="flex w-[min(520px,100%)] shrink-0 flex-col gap-3 max-[1000px]:w-full">
            <FactsPanel v-if="app.economics" :app="app" />
            <p v-if="app.hardware_tier" class="m-0 text-[12.5px] text-t3">Runs comfortably on <strong class="text-t2">{{ tierLabel[app.hardware_tier] }}</strong>.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Alternatives -->
    <section :class="dk.row">
      <div :class="dk.gutter">
        <div :class="dk.secNo">01</div>
        <div :class="dk.secName">ALTERNATIVES</div>
      </div>
      <div :class="dk.body">
        <div :class="dk.rollTitle">Ranked alternatives</div>
        <div class="flex flex-col">
          <div v-for="(alt, i) in alts" :key="alt.id" class="flex items-center gap-[14px] border-b border-surface-2 py-[13px] max-[700px]:flex-wrap">
            <span class="font-mono text-[11.5px] text-faint">{{ String(i + 1).padStart(2, '0') }}</span>
            <ToolLogo :id="alt.id" :name="alt.name" :size="34" />
            <div class="flex min-w-[200px] flex-col gap-[2px]">
              <NuxtLink :to="`/app/${alt.id}`" class="text-[14.5px] font-semibold text-t1 transition-colors hover:text-yes">{{ alt.name }}</NuxtLink>
              <span v-if="alt.tagline" class="text-[12px] text-t3">{{ alt.tagline }}</span>
            </div>
            <div class="flex-1 text-right font-mono text-[11.5px] text-t3">
              <a :href="`https://github.com/${alt.repo}`" class="text-t2">{{ alt.repo }}</a>
              <template v-if="alt.metrics?.stars"> · ★ {{ alt.metrics.stars.toLocaleString() }}</template>
              <template v-if="alt.metrics?.last_commit"> · {{ daysSince(alt.metrics.last_commit) }}d</template>
              <span v-if="alt.metrics && daysSince(alt.metrics.last_commit) != null && daysSince(alt.metrics.last_commit)! > 365" class="text-no"> · ⚠ UNMAINTAINED</span>
            </div>
          </div>
        </div>
        <UiShot v-if="alts[0]" :id="alts[0].id" :name="alts[0].name" />
      </div>
    </section>

    <!-- Evidence -->
    <section v-if="data!.compose || app.verified" :class="[dk.row, dk.rowTinted]">
      <div :class="dk.gutter">
        <div :class="dk.secNo">02</div>
        <div :class="dk.secName">EVIDENCE</div>
      </div>
      <div :class="dk.body">
        <template v-if="app.verified">
          <div class="flex flex-wrap gap-10">
            <div><div :class="dk.metaLabel">PROTOCOL</div><div :class="dk.metaValue">{{ app.verified.protocol }}</div></div>
            <div><div :class="dk.metaLabel">VERIFIED BY</div><div :class="dk.metaValue">{{ app.verified.by }}</div></div>
            <div><div :class="dk.metaLabel">REVIEWED</div><div :class="dk.metaValue">{{ fmtDate(app.verified.at) }}</div></div>
            <div><div :class="dk.metaLabel">SETUP MEASURED</div><div :class="dk.metaValue">{{ app.verified.setup_min }} MIN</div></div>
            <div v-if="app.verified.assistant"><div :class="dk.metaLabel">AI ASSISTANT</div><div :class="dk.metaValue">{{ app.verified.assistant.toUpperCase() }} · STATED</div></div>
          </div>
          <template v-if="app.verified.what_broke?.length">
            <div :class="dk.microLabel">WHAT BROKE</div>
            <div v-for="(w, i) in app.verified.what_broke" :key="w" :class="dk.condition">
              <span :class="dk.conditionIdx">{{ String(i + 1).padStart(2, '0') }}</span>
              <p>{{ w }}</p>
            </div>
          </template>
        </template>
        <template v-if="data!.compose">
          <div :class="dk.microLabel">THE TESTED COMPOSE FILE — CI-BOOTED WEEKLY</div>
          <pre :class="pre">{{ data!.compose }}</pre>
          <p v-if="app.links?.caniselfhostit" class="m-0 text-[12.5px] text-t3">Want a guided install instead? <a :href="app.links.caniselfhostit" class="text-t2 underline">caniselfhostit.com/{{ app.id }}</a> has AI-agent prompts that assume a bare machine — that's their half of the stool, and it's good.</p>
        </template>
        <details v-if="data!.log">
          <summary :class="dk.microLabel" class="cursor-pointer">FULL TIMED LOG</summary>
          <pre :class="pre" class="mt-3">{{ data!.log }}</pre>
        </details>
      </div>
    </section>

    <!-- History -->
    <section v-if="data!.changelog?.length" :class="dk.row">
      <div :class="dk.gutter">
        <div :class="dk.secNo">03</div>
        <div :class="dk.secName">HISTORY</div>
      </div>
      <div :class="dk.body">
        <div class="flex flex-col">
          <div v-for="c in data!.changelog" :key="c.date + c.to" class="flex items-baseline gap-[22px] border-b border-surface-2 py-[11px] text-[12.5px] max-[700px]:flex-wrap">
            <span class="w-[100px] shrink-0 font-mono tabular-nums text-t3">{{ fmtDate(c.date) }}</span>
            <span class="w-[190px] shrink-0 font-mono font-semibold text-t1">{{ c.from ?? 'UNRATED' }} → {{ c.to }}</span>
            <span class="italic text-t2">{{ c.reason }}</span>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>
