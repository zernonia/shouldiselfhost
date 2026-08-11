<script setup lang="ts">
// Head-to-head, desk-style, pure Tailwind: spec table + backs-these columns.
import { dk } from '~/composables/deskClasses'

const route = useRoute()
const { data, error } = await useFetch(`/api/data/vs/${route.params.pair}`)
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Unknown comparison', fatal: true })
}
const a = computed(() => data.value!.a)
const b = computed(() => data.value!.b)
const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - +new Date(iso)) / 86400000) : null)
const fmt = (v: any, suffix = '') => (v == null ? '—' : `${typeof v === 'number' ? v.toLocaleString() : v}${suffix}`)

const rows = computed(() => {
  const A = a.value, B = b.value
  return [
    ['GITHUB STARS', fmt(A.metrics?.stars), fmt(B.metrics?.stars)],
    ['LAST COMMIT', A.metrics?.last_commit ? `${daysSince(A.metrics.last_commit)}d ago` : '—', B.metrics?.last_commit ? `${daysSince(B.metrics.last_commit)}d ago` : '—'],
    ['LATEST RELEASE', A.metrics?.latest_release?.tag ?? '—', B.metrics?.latest_release?.tag ?? '—'],
    ['DOCKER PULLS', fmt(A.metrics?.docker_pulls), fmt(B.metrics?.docker_pulls)],
    ['LICENSE', A.license ?? '—', B.license ?? '—'],
    ['MIN RAM', fmt(A.resources?.ram_min_mb, ' MB'), fmt(B.resources?.ram_min_mb, ' MB')],
    ['CONTAINERS', fmt(A.resources?.containers), fmt(B.resources?.containers)],
    ['ARM (PI-FRIENDLY)', A.resources?.arm64 == null ? '—' : A.resources.arm64 ? 'yes' : 'no', B.resources?.arm64 == null ? '—' : B.resources.arm64 ? 'yes' : 'no'],
  ]
})

const specCol = 'w-40 shrink-0 font-mono tabular-nums text-[13px] text-t1'

useHead({ title: () => `${a.value?.name} vs ${b.value?.name}` })
useSeoMeta({
  description: () => `${a.value?.name} vs ${b.value?.name}: freshness, resource needs, and the self-hosting verdicts each one backs — compared on data, not vibes.`,
})
</script>

<template>
  <article v-if="a && b">
    <section :class="dk.row" class="pt-[54px]!">
      <div :class="dk.gutter">
        <div :class="dk.secNo">VS</div>
        <div :class="dk.secName">HEAD-TO-HEAD</div>
      </div>
      <div :class="dk.body">
        <div class="flex flex-wrap items-center gap-4">
          <ToolLogo :id="a.id" :name="a.name" :size="44" />
          <h1 class="m-0 font-display text-[clamp(24px,3vw,38px)] font-medium tracking-[-1.4px] text-t1">{{ a.name }} <span class="italic text-t3">vs</span> {{ b.name }}</h1>
          <ToolLogo :id="b.id" :name="b.name" :size="44" />
        </div>
        <p :class="dk.rollSub">Compared on data, not vibes. Metrics refresh nightly; verdict links carry the math.</p>
        <div class="flex max-w-[760px] flex-col">
          <div class="flex items-center gap-[22px] border-b border-line pb-[13px]">
            <span class="flex-1" />
            <NuxtLink :to="`/app/${a.id}`" :class="specCol" class="font-semibold tracking-[1px] text-t2 transition-colors hover:text-yes text-[10.5px]!">{{ a.name.toUpperCase() }}</NuxtLink>
            <NuxtLink :to="`/app/${b.id}`" :class="specCol" class="font-semibold tracking-[1px] text-t2 transition-colors hover:text-yes text-[10.5px]!">{{ b.name.toUpperCase() }}</NuxtLink>
          </div>
          <div v-for="[label, va, vb] in rows" :key="label" class="flex items-center gap-[22px] border-b border-surface-2 py-[11px]">
            <span class="flex-1 font-mono text-[10px] tracking-[1.2px] text-faint">{{ label }}</span>
            <span :class="specCol">{{ va }}</span>
            <span :class="specCol">{{ vb }}</span>
          </div>
        </div>
      </div>
    </section>

    <section :class="dk.row">
      <div :class="dk.gutter">
        <div :class="dk.secNo">01</div>
        <div :class="dk.secName">BACKS</div>
      </div>
      <div :class="dk.body">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">
          <div v-for="side in [a, b]" :key="side.id" class="flex flex-col gap-[10px]">
            <div :class="dk.microLabel">{{ side.name.toUpperCase() }} BACKS THESE RATINGS</div>
            <p v-if="side.tagline" class="m-0 mb-1 text-[12.5px] text-t3">{{ side.tagline }}</p>
            <NuxtLink v-for="app in side.replaces" :key="app.id" :to="`/${app.id}`" class="group flex items-center gap-3 border-b border-surface-2 py-[9px]">
              <DeskAppAvatar :id="app.id" :name="app.name" :verdict="app.verdict" :size="26" />
              <span class="flex-1 text-[13.5px] font-medium text-t1 transition-colors group-hover:text-yes">{{ app.name }}</span>
              <DeskRatingTag :verdict="app.verdict" />
            </NuxtLink>
          </div>
        </div>
        <p :class="dk.liveNote">Neither page tells you which is “better” — they solve the same jobs differently. Pick by the constraint that binds you: RAM, ARM, license, or how alive the project looks.</p>
      </div>
    </section>
  </article>
</template>
