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
    <section class="row hero-row">
      <div class="gutter">
        <div class="sec-no">OSS</div>
        <div class="sec-name">OPEN SOURCE</div>
      </div>
      <div class="body">
      <div class="oss-head"><ToolLogo :id="alt.id" :name="alt.name" :size="56" /><h1 class="oss-h1">{{ alt.name }}</h1></div>
      <p v-if="alt.tagline" class="roll-sub">{{ alt.tagline }}</p>
      <div class="meta num">
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
      <UiShot :id="alt.id" :name="alt.name" />
      </div>
    </section>

    <section class="row">
      <div class="gutter">
        <div class="sec-no">01</div>
        <div class="sec-name">REPLACES</div>
      </div>
      <div class="body">
        <div class="roll-title">One tool, {{ replaces.length }} subscription{{ replaces.length === 1 ? '' : 's' }}</div>
        <p class="roll-sub">The same server can serve several escape hatches — that's how a $5 VPS beats a $50 SaaS bill.</p>
        <div class="back-rows">
          <NuxtLink v-for="a in replaces" :key="a.id" :to="`/${a.id}`" class="back-row">
            <DeskAppAvatar :id="a.id" :name="a.name" :verdict="a.verdict" :size="26" />
            <span class="back-name">{{ a.name }}</span>
            <span class="back-price num">${{ a.price_usd_mo }}/mo</span>
            <DeskRatingTag :verdict="a.verdict" />
          </NuxtLink>
        </div>
        <p v-if="alt.notes" class="live-note">{{ alt.notes }}</p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.hero-row { padding-top: 54px; }
.oss-head { display: flex; align-items: center; gap: 16px; }
.oss-h1 { font-family: var(--display); font-size: clamp(26px, 3vw, 40px); font-weight: 500; letter-spacing: -1.5px; margin: 0; color: var(--d-t1); }
.meta { font-size: 12px; color: var(--d-t3); }
.meta a { color: var(--d-t2); }
.back-rows { display: flex; flex-direction: column; max-width: 640px; }
.back-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--d-surface-2); }
.back-name { flex: 1; font-size: 13.5px; font-weight: 500; color: var(--d-t1); }
.back-row:hover .back-name { color: var(--yes); }
.back-price { font-size: 12px; color: var(--d-t3); }
</style>
