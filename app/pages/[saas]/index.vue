<script setup lang="ts">
const route = useRoute()
const { data, error } = await useFetch(`/api/data/app/${route.params.saas}`)
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not scored yet', fatal: true })
}
const app = computed(() => data.value!.app)
const alts = computed(() => data.value!.alternatives ?? [])
const site = computed(() => data.value!.site)

const tierLabel: Record<string, string> = {
  pi: 'Raspberry Pi', 'old-laptop': 'the old laptop in your closet', vps: 'a real VPS (2 GB+)',
}
const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - +new Date(iso)) / 86400000) : null)

useHead({ title: () => `Should I self-host ${app.value?.name}?` })
useSeoMeta({
  description: () => app.value?.verdict_reason ?? `Should you self-host a replacement for ${app.value?.name}? The math, the verdict, the tested compose file.`,
  ogTitle: () => `Should I self-host ${app.value?.name}?`,
  ogImage: () => `https://shouldiselfhost.com/og/${app.value?.id}.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <article v-if="app">
    <header class="page-head">
      <span v-reveal class="eyebrow">{{ app.category ?? 'verdict' }}</span>
      <div v-reveal="1" class="pairing">
        <AppTile :id="app.id" :name="app.name" :size="56" />
        <span class="pair-arrow">→</span>
        <ToolLogo v-if="alts[0]" :id="alts[0].id" :name="alts[0].name" :size="56" />
      </div>
      <h1 v-reveal="1">Should I self-host <em>{{ app.name }}</em>?</h1>
      <div v-reveal="2" class="verdict-row">
        <VerdictBadge :verdict="app.verdict" :stale="app.derived.verdict_stale" />
        <VoteButton :app-id="app.id" />
      </div>
      <p v-if="app.verdict_reason" class="reason">{{ app.verdict_reason }}</p>
      <p v-else class="reason dim">
        NOT SCORED YET — the capability layer says it's possible; nobody has done the honest math
        under <NuxtLink to="/methodology">protocol v1</NuxtLink>. That's a
        <a href="https://github.com/zernonia/shouldiselfhost/blob/main/CONTRIBUTING.md">PR</a> waiting to happen.
      </p>
    </header>

    <TheMath v-if="app.economics" :app="app" />

    <section v-if="app.what_you_lose?.length" class="section">
      <h2>What you lose</h2>
      <ul><li v-for="loss in app.what_you_lose" :key="loss">{{ loss }}</li></ul>
    </section>

    <section v-if="app.jobs?.length" class="section">
      <h2>What you're paying {{ app.name }} for</h2>
      <ul><li v-for="job in app.jobs" :key="job">{{ job }}</li></ul>
    </section>

    <section v-if="alts[0]" class="section">
      <UiShot :id="alts[0].id" :name="alts[0].name" />
    </section>

    <section class="section">
      <h2>Ranked alternatives</h2>
      <div class="alt-list">
        <div v-for="(alt, i) in alts" :key="alt.id" v-reveal="i" class="card alt-card">
          <div class="card-top">
            <span class="alt-name"><ToolLogo :id="alt.id" :name="alt.name" :size="36" /><strong><NuxtLink :to="`/app/${alt.id}`">{{ i + 1 }}. {{ alt.name }}</NuxtLink></strong></span>
            <span v-if="alt.metrics && daysSince(alt.metrics.last_commit) != null && daysSince(alt.metrics.last_commit)! > 365" class="badge NOT_REALLY small">⚠️ unmaintained</span>
          </div>
          <p v-if="alt.tagline" class="dim">{{ alt.tagline }}</p>
          <div class="dim meta num">
            <a :href="`https://github.com/${alt.repo}`">{{ alt.repo }}</a>
            <template v-if="alt.metrics?.stars"> · ★ {{ alt.metrics.stars.toLocaleString() }}</template>
            <template v-if="alt.metrics?.last_commit"> · last commit {{ daysSince(alt.metrics.last_commit) }}d ago</template>
            <template v-if="alt.metrics?.docker_pulls"> · {{ alt.metrics.docker_pulls.toLocaleString() }} pulls</template>
            <template v-if="alt.license"> · {{ alt.license }}</template>
          </div>
        </div>
      </div>
    </section>

    <section v-if="app.hardware_tier" class="section">
      <h2>Hardware</h2>
      <p>Runs comfortably on <strong>{{ tierLabel[app.hardware_tier] }}</strong>.</p>
    </section>

    <section v-if="data!.compose" class="section">
      <h2>The tested compose file <span class="dim">(our evidence, CI-booted)</span></h2>
      <pre><code>{{ data!.compose }}</code></pre>
      <p class="dim">
        <template v-if="app.links?.caniselfhostit">
          Want a guided install instead? <a :href="app.links.caniselfhostit">caniselfhostit.com/{{ app.id }}</a>
          has AI-agent prompts that assume a bare machine — that's their half of the stool, and it's good.
        </template>
      </p>
    </section>

    <section v-if="app.verified" class="section">
      <h2>Verification</h2>
      <div class="card">
        <p class="num">
          Protocol {{ app.verified.protocol }} · verified by <strong>{{ app.verified.by }}</strong> on {{ app.verified.at }}
          · setup measured at <strong>{{ app.verified.setup_min }} min</strong>
          <template v-if="app.verified.assistant"> · AI assistant: {{ app.verified.assistant }} (allowed & stated)</template>
        </p>
        <template v-if="app.verified.what_broke?.length">
          <h3>What broke</h3>
          <ul><li v-for="w in app.verified.what_broke" :key="w">{{ w }}</li></ul>
        </template>
        <details v-if="data!.log">
          <summary>Full timed log</summary>
          <pre>{{ data!.log }}</pre>
        </details>
      </div>
    </section>

    <section v-if="data!.changelog?.length" class="section">
      <h2>Verdict history</h2>
      <ul class="dim">
        <li v-for="c in data!.changelog" :key="c.date + c.to" class="num">
          {{ c.date }}: {{ c.from ?? 'unscored' }} → {{ c.to }} — <span class="reason-inline">{{ c.reason }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.page-head { display: flex; flex-direction: column; gap: 0.9rem; align-items: flex-start; margin-bottom: 3rem; }
.page-head h1 { margin: 0; }
.page-head h1 em { font-style: normal; color: var(--accent); }
.verdict-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.reason { font-size: 1.12rem; margin: 0; max-width: 46rem; color: var(--text); }
.section { margin: 3.5rem 0; }
.section h2 { font-size: 1.15rem; margin-bottom: 1rem; }
.alt-list { display: flex; flex-direction: column; gap: 0.8rem; }
.card-top { display: flex; justify-content: space-between; gap: 0.6rem; align-items: center; }
.alt-name { display: inline-flex; align-items: center; gap: 0.65rem; }
.pairing { display: flex; align-items: center; gap: 0.9rem; }
.pair-arrow { font-size: 1.5rem; color: var(--text-faint); }
.meta { font-size: 0.82rem; }
.reason-inline { font-style: italic; }
ul { padding-left: 1.2rem; }
ul li { margin: 0.4rem 0; }
</style>
