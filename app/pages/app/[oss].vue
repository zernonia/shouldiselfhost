<script setup lang="ts">
import { dk } from '~/composables/deskClasses'

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
    <section :class="dk.row" class="pt-[54px]!">
      <div :class="dk.gutter">
        <div :class="dk.secNo">OSS</div>
        <div :class="dk.secName">OPEN SOURCE</div>
      </div>
      <div :class="dk.body">
      <div class="flex items-center gap-4"><ToolLogo :id="alt.id" :name="alt.name" :size="56" /><h1 class="m-0 font-display text-[clamp(26px,3vw,40px)] font-medium tracking-[-1.5px] text-t1">{{ alt.name }}</h1></div>
      <p v-if="alt.tagline" :class="dk.rollSub">{{ alt.tagline }}</p>
      <div class="font-mono tabular-nums text-[12px] text-t3 [&>a]:text-t2">
        <a :href="`https://github.com/${alt.repo}`">{{ alt.repo }}</a>
        <template v-if="alt.metrics?.stars"> · ★ {{ alt.metrics.stars.toLocaleString() }}</template>
        <template v-if="alt.metrics?.last_commit"> · last commit {{ daysSince(alt.metrics.last_commit) }}d ago</template>
        <template v-if="alt.license"> · {{ alt.license }}</template>
        <template v-if="alt.resources?.ram_min_mb"> · needs {{ alt.resources.ram_min_mb }} MB RAM</template>
        <template v-if="alt.resources?.arm64 != null"> · {{ alt.resources.arm64 ? 'runs on ARM (Pi-friendly)' : 'no ARM builds' }}</template>
      </div>
      <p v-if="alt.metrics && daysSince(alt.metrics.last_commit) != null && daysSince(alt.metrics.last_commit)! > 365" class="m-0 font-mono text-[12px] font-semibold tracking-[0.8px] text-no">
        ⚠ UNMAINTAINED — LAST COMMIT OVER A YEAR AGO
      </p>
      <UiShot :id="alt.id" :name="alt.name" />
      </div>
    </section>

    <section :class="dk.row">
      <div :class="dk.gutter">
        <div :class="dk.secNo">01</div>
        <div :class="dk.secName">REPLACES</div>
      </div>
      <div :class="dk.body">
        <div :class="dk.rollTitle">One tool, {{ replaces.length }} subscription{{ replaces.length === 1 ? '' : 's' }}</div>
        <p :class="dk.rollSub">The same server can serve several escape hatches — that's how a $5 VPS beats a $50 SaaS bill.</p>
        <div class="flex max-w-[640px] flex-col">
          <NuxtLink v-for="a in replaces" :key="a.id" :to="`/${a.id}`" class="group flex items-center gap-3 border-b border-surface-2 py-[10px]">
            <DeskAppAvatar :id="a.id" :name="a.name" :verdict="a.verdict" :size="26" />
            <span class="flex-1 text-[13.5px] font-medium text-t1 transition-colors group-hover:text-yes">{{ a.name }}</span>
            <span class="font-mono tabular-nums text-[12px] text-t3">${{ a.price_usd_mo }}/mo</span>
            <DeskRatingTag :verdict="a.verdict" />
          </NuxtLink>
        </div>
        <p v-if="alt.notes" :class="dk.liveNote">{{ alt.notes }}</p>
      </div>
    </section>
  </article>
</template>

