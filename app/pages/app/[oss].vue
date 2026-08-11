<script setup lang="ts">
const route = useRoute()
const { data, error } = await useFetch(`/api/data/alt/${route.params.oss}`)
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Unknown tool', fatal: true })
}
const alt = computed(() => data.value!.alt)
const replaces = computed(() => data.value!.replaces ?? [])
const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - +new Date(iso)) / 86400000) : null)

useHead({ title: () => `${alt.value?.name} — what it replaces, and whether it's worth it` })
</script>

<template>
  <article v-if="alt">
    <header class="page-head">
      <span v-reveal class="eyebrow">Open source</span>
      <div v-reveal="1" class="oss-head"><ToolLogo :id="alt.id" :name="alt.name" :size="56" /><h1>{{ alt.name }}</h1></div>
      <p v-if="alt.tagline" class="dim">{{ alt.tagline }}</p>
      <div class="dim meta num">
        <a :href="`https://github.com/${alt.repo}`">{{ alt.repo }}</a>
        <template v-if="alt.metrics?.stars"> · ★ {{ alt.metrics.stars.toLocaleString() }}</template>
        <template v-if="alt.metrics?.last_commit"> · last commit {{ daysSince(alt.metrics.last_commit) }}d ago</template>
        <template v-if="alt.license"> · {{ alt.license }}</template>
        <template v-if="alt.resources?.ram_min_mb"> · needs {{ alt.resources.ram_min_mb }} MB RAM</template>
        <template v-if="alt.resources?.arm64 != null"> · {{ alt.resources.arm64 ? 'runs on ARM (Pi-friendly)' : 'no ARM builds' }}</template>
      </div>
      <p v-if="alt.metrics && daysSince(alt.metrics.last_commit) != null && daysSince(alt.metrics.last_commit)! > 365" class="badge NOT_REALLY">
        ⚠️ unmaintained — last commit over a year ago
      </p>
    </header>

    <section class="section">
      <UiShot :id="alt.id" :name="alt.name" />
    </section>

    <section class="section">
      <h2>One tool, {{ replaces.length }} subscription{{ replaces.length === 1 ? '' : 's' }}</h2>
      <p class="dim">The same server can serve several escape hatches — that's how a $5 VPS beats a $50 SaaS bill.</p>
      <div class="grid">
        <NuxtLink v-for="a in replaces" :key="a.id" :to="`/${a.id}`" class="card app-card">
          <div class="card-top"><strong>{{ a.name }}</strong><VerdictBadge :verdict="a.verdict" small /></div>
          <div class="dim meta num">${{ a.price_usd_mo }}/mo<template v-if="a.derived.break_even_months != null"> · breaks even in {{ a.derived.break_even_months.toFixed(1) }} mo</template></div>
        </NuxtLink>
      </div>
    </section>

    <p v-if="alt.notes" class="card dim">{{ alt.notes }}</p>
  </article>
</template>

<style scoped>
.oss-head { display: flex; align-items: center; gap: 1rem; }
.oss-head h1 { margin: 0; }
.section { margin: 2rem 0; }
.section h2 { font-size: 1.1rem; }
.meta { font-size: 0.85rem; margin: 0.4rem 0 0.8rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.8rem; }
.app-card { color: var(--text); display: block; }
.app-card:hover { text-decoration: none; border-color: var(--accent); }
.card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
</style>
