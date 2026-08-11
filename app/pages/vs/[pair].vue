<script setup lang="ts">
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
    ['GitHub stars', fmt(A.metrics?.stars), fmt(B.metrics?.stars)],
    ['Last commit', A.metrics?.last_commit ? `${daysSince(A.metrics.last_commit)}d ago` : '—', B.metrics?.last_commit ? `${daysSince(B.metrics.last_commit)}d ago` : '—'],
    ['Latest release', A.metrics?.latest_release?.tag ?? '—', B.metrics?.latest_release?.tag ?? '—'],
    ['Docker pulls', fmt(A.metrics?.docker_pulls), fmt(B.metrics?.docker_pulls)],
    ['License', A.license ?? '—', B.license ?? '—'],
    ['Min RAM', fmt(A.resources?.ram_min_mb, ' MB'), fmt(B.resources?.ram_min_mb, ' MB')],
    ['Containers', fmt(A.resources?.containers), fmt(B.resources?.containers)],
    ['ARM (Pi-friendly)', A.resources?.arm64 == null ? '—' : A.resources.arm64 ? 'yes' : 'no', B.resources?.arm64 == null ? '—' : B.resources.arm64 ? 'yes' : 'no'],
  ]
})

useHead({ title: () => `${a.value?.name} vs ${b.value?.name}` })
useSeoMeta({
  description: () => `${a.value?.name} vs ${b.value?.name}: freshness, resource needs, and the self-hosting verdicts each one backs — compared on data, not vibes.`,
})
</script>

<template>
  <article v-if="a && b">
    <span v-reveal class="eyebrow">Head-to-head</span>
    <h1 v-reveal="1" class="vs-title"><ToolLogo :id="a.id" :name="a.name" :size="44" /> {{ a.name }} <span class="dim">vs</span> <ToolLogo :id="b.id" :name="b.name" :size="44" /> {{ b.name }}</h1>
    <p class="dim">Compared on data, not vibes. Metrics refresh nightly; verdict links carry the math.</p>

    <div class="card">
      <table class="board">
        <thead>
          <tr>
            <th></th>
            <th><NuxtLink :to="`/app/${a.id}`">{{ a.name }}</NuxtLink></th>
            <th><NuxtLink :to="`/app/${b.id}`">{{ b.name }}</NuxtLink></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[label, va, vb] in rows" :key="label">
            <td class="dim">{{ label }}</td>
            <td class="num">{{ va }}</td>
            <td class="num">{{ vb }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="cols">
      <div v-for="side in [a, b]" :key="side.id" class="side">
        <h2>{{ side.name }}</h2>
        <p v-if="side.tagline" class="dim">{{ side.tagline }}</p>
        <p v-if="side.notes" class="dim small">{{ side.notes }}</p>
        <h3 class="dim small">Backs these verdicts</h3>
        <div class="stack-list">
          <NuxtLink v-for="app in side.replaces" :key="app.id" :to="`/${app.id}`" class="card app-card">
            <span>{{ app.name }}</span>
            <VerdictBadge :verdict="app.verdict" small />
          </NuxtLink>
        </div>
      </div>
    </section>

    <p class="dim">
      Neither page tells you which is "better" — they solve the same jobs differently. Pick by
      the constraint that binds you: RAM, ARM, license, or how alive the project looks.
    </p>
  </article>
</template>

<style scoped>
.vs-title { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
.side h2 { font-size: 1.15rem; margin-bottom: 0.3rem; }
.small { font-size: 0.85rem; }
.stack-list { display: flex; flex-direction: column; gap: 0.5rem; }
.app-card { color: var(--text); display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; }
.app-card:hover { text-decoration: none; border-color: var(--accent); }
</style>
