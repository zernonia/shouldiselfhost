<script setup lang="ts">
import { escapedUsdMo } from '#shared/derive.mjs'

const { data } = await useFetch('/api/data/apps')
const apps = computed(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a: any) => a.verdict))
const honestNos = computed(() => scored.value.filter((a: any) => a.verdict === 'NOT_REALLY'))

// The ticking number — hydrates client-side; verdict pages stay fully static.
const votes = ref<Record<string, number>>({})
const escaped = computed(() => escapedUsdMo(apps.value, votes.value))
onMounted(async () => {
  try { votes.value = (await $fetch<{ votes: Record<string, number> }>('/api/votes')).votes } catch {}
})

const escapeBoard = computed(() =>
  [...apps.value]
    .map((a: any) => ({ ...a, voteCount: votes.value[a.id] ?? 0 }))
    .sort((a: any, b: any) => b.voteCount - a.voteCount || (b.derived.markup_index ?? 0) - (a.derived.markup_index ?? 0))
    .slice(0, 10))

const markupBoard = computed(() =>
  scored.value
    .filter((a: any) => a.derived.markup_index != null)
    .sort((a: any, b: any) => b.derived.markup_index - a.derived.markup_index)
    .slice(0, 10))

const q = ref('')
const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const list = [...apps.value].sort((a: any, b: any) => (a.verdict ? 0 : 1) - (b.verdict ? 0 : 1) || a.name.localeCompare(b.name))
  if (!needle) return list
  return list.filter((a: any) => a.name.toLowerCase().includes(needle) || a.id.includes(needle))
})

useHead({ title: 'Should I self-host it?' })
</script>

<template>
  <div>
    <section class="hero">
      <h1>Subscription money escaped:</h1>
      <div class="counter num">${{ escaped.toFixed(2) }}<span class="permo">/mo</span></div>
      <pre class="how">escaped = Σ (app.price_usd_mo × votes)   // shown as code because we show our work</pre>
      <p class="dim">
        caniselfhostit.com refuses to sum — <em>"you'd replace them one at a time."</em> Fair.
        We sum anyway: that's the scoreboard. Vote ✋ on the apps you actually self-host.
      </p>
    </section>

    <section v-if="honestNos.length" class="section">
      <h2>The honest NOs <span class="dim">— self-hostable, and we still say keep paying</span></h2>
      <div class="grid">
        <NuxtLink v-for="a in honestNos" :key="a.id" :to="`/${a.id}`" class="card app-card">
          <div class="card-top"><strong>{{ a.name }}</strong><VerdictBadge :verdict="a.verdict" small /></div>
          <p class="dim reason">{{ a.verdict_reason }}</p>
        </NuxtLink>
      </div>
    </section>

    <div class="boards">
      <section class="section">
        <h2>Escape Board <span class="dim">— most self-hosted, by votes</span></h2>
        <div class="card">
          <table class="board">
            <thead><tr><th>App</th><th class="r">✋</th><th class="r">$/mo each</th></tr></thead>
            <tbody>
              <tr v-for="a in escapeBoard" :key="a.id">
                <td><NuxtLink :to="`/${a.id}`">{{ a.name }}</NuxtLink> <VerdictBadge :verdict="a.verdict" small /></td>
                <td class="r num">{{ a.voteCount }}</td>
                <td class="r num">${{ a.price_usd_mo.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <h2>Markup Index <span class="dim">— price ÷ real self-host cost</span></h2>
        <div class="card">
          <table class="board">
            <thead><tr><th>App</th><th class="r">markup</th><th class="r">break-even</th></tr></thead>
            <tbody>
              <tr v-for="a in markupBoard" :key="a.id">
                <td><NuxtLink :to="`/${a.id}`">{{ a.name }}</NuxtLink></td>
                <td class="r num">{{ a.derived.markup_index.toFixed(1) }}×</td>
                <td class="r num">{{ a.derived.break_even_months != null ? a.derived.break_even_months.toFixed(1) + ' mo' : 'never' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section class="section">
      <h2>All {{ apps.length }} apps <span class="dim">({{ scored.length }} scored — the rest are waiting for your PR)</span></h2>
      <input v-model="q" class="search" type="search" placeholder="Which subscription is bugging you?" />
      <div class="grid">
        <NuxtLink v-for="a in filtered" :key="a.id" :to="`/${a.id}`" class="card app-card">
          <div class="card-top"><strong>{{ a.name }}</strong><VerdictBadge :verdict="a.verdict" small :stale="a.derived.verdict_stale" /></div>
          <div class="dim meta num">${{ a.price_usd_mo }}/mo<template v-if="a.derived.break_even_months != null"> · breaks even in {{ a.derived.break_even_months.toFixed(1) }} mo</template></div>
        </NuxtLink>
      </div>
      <p v-if="q && !filtered.length" class="card">
        <strong>NOT SCORED YET.</strong> No entry for “{{ q }}” — that page is one
        <a href="https://github.com/zernonia/shouldiselfhost/blob/main/CONTRIBUTING.md">evidence-backed PR</a> away.
      </p>
    </section>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 1rem 0 2rem; }
.hero h1 { font-size: 1.3rem; margin-bottom: 0.2rem; }
.counter { font-size: 3.4rem; font-weight: 700; color: var(--yes); }
.permo { font-size: 1.4rem; color: var(--text-dim); }
.how { display: inline-block; font-size: 0.8rem; margin: 0.6rem 0; text-align: left; }
.section { margin: 2.2rem 0; }
.section h2 { font-size: 1.1rem; }
.boards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.8rem; }
.app-card { color: var(--text); display: block; }
.app-card:hover { text-decoration: none; border-color: var(--accent); }
.card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.reason { font-size: 0.82rem; margin: 0.4rem 0 0; }
.meta { font-size: 0.8rem; margin-top: 0.3rem; }
.search {
  width: 100%; font: inherit; color: var(--text); background: var(--bg-raise);
  border: 1px solid var(--border); border-radius: 8px; padding: 0.6em 0.9em; margin-bottom: 1rem;
}
</style>
