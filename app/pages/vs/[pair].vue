<script setup lang="ts">
// Head-to-head, desk-style: spec table + "backs these verdicts" columns.
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

useHead({ title: () => `${a.value?.name} vs ${b.value?.name}` })
useSeoMeta({
  description: () => `${a.value?.name} vs ${b.value?.name}: freshness, resource needs, and the self-hosting verdicts each one backs — compared on data, not vibes.`,
})
</script>

<template>
  <article v-if="a && b">
    <section class="row hero-row">
      <div class="gutter">
        <div class="sec-no">VS</div>
        <div class="sec-name">HEAD-TO-HEAD</div>
      </div>
      <div class="body">
        <div class="vs-head">
          <ToolLogo :id="a.id" :name="a.name" :size="44" />
          <h1 class="vs-h1">{{ a.name }} <span class="vs-sep">vs</span> {{ b.name }}</h1>
          <ToolLogo :id="b.id" :name="b.name" :size="44" />
        </div>
        <p class="roll-sub">Compared on data, not vibes. Metrics refresh nightly; verdict links carry the math.</p>
        <div class="spec-table">
          <div class="spec-head">
            <span class="spec-label" />
            <NuxtLink :to="`/app/${a.id}`" class="spec-col strong">{{ a.name.toUpperCase() }}</NuxtLink>
            <NuxtLink :to="`/app/${b.id}`" class="spec-col strong">{{ b.name.toUpperCase() }}</NuxtLink>
          </div>
          <div v-for="[label, va, vb] in rows" :key="label" class="spec-row">
            <span class="spec-label">{{ label }}</span>
            <span class="spec-col num">{{ va }}</span>
            <span class="spec-col num">{{ vb }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="row">
      <div class="gutter">
        <div class="sec-no">01</div>
        <div class="sec-name">BACKS</div>
      </div>
      <div class="body">
        <div class="sides">
          <div v-for="side in [a, b]" :key="side.id" class="side">
            <div class="micro-label">{{ side.name.toUpperCase() }} BACKS THESE RATINGS</div>
            <p v-if="side.tagline" class="side-tag">{{ side.tagline }}</p>
            <NuxtLink v-for="app in side.replaces" :key="app.id" :to="`/${app.id}`" class="back-row">
              <DeskAppAvatar :id="app.id" :name="app.name" :verdict="app.verdict" :size="26" />
              <span class="back-name">{{ app.name }}</span>
              <DeskRatingTag :verdict="app.verdict" />
            </NuxtLink>
          </div>
        </div>
        <p class="live-note">Neither page tells you which is “better” — they solve the same jobs differently. Pick by the constraint that binds you: RAM, ARM, license, or how alive the project looks.</p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.hero-row { padding-top: 54px; }
.vs-head { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.vs-h1 { font-family: var(--display); font-size: clamp(24px, 3vw, 38px); font-weight: 500; letter-spacing: -1.4px; margin: 0; color: var(--d-t1); }
.vs-sep { color: var(--d-t3); font-style: italic; }
.spec-table { display: flex; flex-direction: column; max-width: 760px; }
.spec-head, .spec-row { display: flex; gap: 22px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--d-surface-2); }
.spec-head { border-bottom: 1px solid var(--d-border); padding-bottom: 13px; }
.spec-label { flex: 1; font-family: var(--mono); font-size: 10px; letter-spacing: 1.2px; color: var(--d-faint); }
.spec-col { width: 160px; flex-shrink: 0; font-size: 13px; color: var(--d-t1); }
.spec-col.strong { font-family: var(--mono); font-size: 10.5px; letter-spacing: 1px; font-weight: 600; color: var(--d-t2); }
.spec-col.strong:hover { color: var(--yes); }
.sides { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.side { display: flex; flex-direction: column; gap: 10px; }
.side-tag { font-size: 12.5px; color: var(--d-t3); margin: 0 0 4px; }
.back-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--d-surface-2); }
.back-name { flex: 1; font-size: 13.5px; font-weight: 500; color: var(--d-t1); }
.back-row:hover .back-name { color: var(--yes); }
</style>
