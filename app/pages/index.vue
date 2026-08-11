<script setup lang="ts">
import { escapedUsdMo } from '#shared/derive.mjs'

const { data } = await useFetch('/api/data/apps')
const apps = computed(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a: any) => a.verdict))
const counts = computed(() => ({
  yes: scored.value.filter((a: any) => a.verdict === 'YES').length,
  kinda: scored.value.filter((a: any) => a.verdict === 'KINDA').length,
  no: scored.value.filter((a: any) => a.verdict === 'NOT_REALLY').length,
}))
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
    <!-- Hero -->
    <section class="hero">
      <span v-reveal class="eyebrow">The decision layer for self-hosting</span>
      <h1 v-reveal="1" class="hero-title">They tell you if you <em>can</em>.<br />We tell you if you <em>should</em>.</h1>
      <div v-reveal="2" class="counter-wrap">
        <div class="counter-label">Subscription money escaped</div>
        <div class="counter num">${{ escaped.toFixed(2) }}<span class="permo">/mo</span></div>
        <pre class="how">escaped = Σ (app.price_usd_mo × votes)   // we show our work</pre>
      </div>
      <div v-reveal="3" class="tally">
        <span class="t yes num">{{ counts.yes }} YES</span>
        <span class="t kinda num">{{ counts.kinda }} KINDA</span>
        <span class="t no num">{{ counts.no }} NOT REALLY</span>
        <span class="dim">of {{ apps.length }} apps</span>
      </div>
    </section>

    <!-- Honest NOs — the trust feature, front and center -->
    <section v-if="honestNos.length" class="section">
      <div v-reveal class="section-head">
        <span class="eyebrow">The trust feature</span>
        <h2>The honest NOs <span class="dim">— self-hostable, and we still say keep paying</span></h2>
      </div>
      <div class="grid">
        <NuxtLink v-for="(a, i) in honestNos" :key="a.id" v-reveal="(i % 4) + 1" :to="`/${a.id}`" class="shell">
          <div class="core">
            <div class="card-top"><strong class="app-name">{{ a.name }}</strong><VerdictBadge :verdict="a.verdict" small /></div>
            <p class="dim reason">{{ a.verdict_reason }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Leaderboards -->
    <div class="boards section">
      <section v-reveal>
        <div class="section-head">
          <span class="eyebrow">By your votes</span>
          <h2>Escape Board</h2>
        </div>
        <div class="shell">
          <div class="core">
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
        </div>
      </section>

      <section v-reveal="2">
        <div class="section-head">
          <span class="eyebrow">By the math</span>
          <h2>Markup Index</h2>
        </div>
        <div class="shell">
          <div class="core">
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
        </div>
      </section>
    </div>

    <!-- All apps -->
    <section class="section">
      <div v-reveal class="section-head">
        <span class="eyebrow">The scoreboard</span>
        <h2>All {{ apps.length }} apps <span class="dim">({{ scored.length }} scored)</span></h2>
      </div>
      <input v-model="q" v-reveal class="search" type="search" placeholder="Which subscription is bugging you?" />
      <div class="grid tight">
        <NuxtLink v-for="a in filtered" :key="a.id" :to="`/${a.id}`" class="shell">
          <div class="core">
            <div class="card-top"><strong class="app-name">{{ a.name }}</strong><VerdictBadge :verdict="a.verdict" small :stale="a.derived.verdict_stale" /></div>
            <div class="dim meta num">${{ a.price_usd_mo }}/mo<template v-if="a.derived.break_even_months != null"> · breaks even in {{ a.derived.break_even_months.toFixed(1) }} mo</template></div>
          </div>
        </NuxtLink>
      </div>
      <p v-if="q && !filtered.length" class="card">
        <strong>NOT SCORED YET.</strong> No entry for “{{ q }}” — that page is one
        <a href="https://github.com/zernonia/shouldiselfhost/blob/main/CONTRIBUTING.md">evidence-backed PR</a> away.
      </p>
    </section>

    <!-- Newsletter -->
    <section v-reveal class="section">
      <NewsletterCard />
    </section>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 3rem 0 1rem; display: flex; flex-direction: column; align-items: center; gap: 1.4rem; }
.hero-title { margin: 0; }
.hero-title em { font-style: italic; color: var(--text-dim); }
.counter-wrap { margin-top: 1rem; }
.counter-label {
  font-family: var(--display); font-size: 0.78rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.4rem;
}
.counter {
  font-size: clamp(3rem, 8vw, 5.2rem); font-weight: 700; color: var(--yes);
  line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 60px rgba(52, 211, 153, 0.25);
}
.permo { font-size: 0.35em; color: var(--text-dim); font-weight: 400; }
.how { display: inline-block; font-size: 0.76rem; margin: 1rem 0 0; text-align: left; color: var(--text-dim); }
.tally { display: flex; gap: 1.2rem; align-items: baseline; font-size: 0.9rem; flex-wrap: wrap; justify-content: center; }
.t { font-weight: 700; }
.t.yes { color: var(--yes); } .t.kinda { color: var(--kinda); } .t.no { color: var(--no); }

.boards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.9rem; }
.grid.tight { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
.card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.app-name { font-family: var(--display); font-weight: 500; font-size: 1.02rem; }
.reason { font-size: 0.82rem; margin: 0.5rem 0 0; }
.meta { font-size: 0.78rem; margin-top: 0.45rem; }
.search { margin-bottom: 1.2rem; }

@media (max-width: 768px) {
  .hero { padding-top: 1rem; }
  .boards { grid-template-columns: 1fr; }
}
</style>
