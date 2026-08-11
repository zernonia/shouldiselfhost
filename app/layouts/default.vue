<script setup lang="ts">
// Desk chrome — masthead, running head, live actions ticker, colophon.
// Structure and values from frame UJL2k in untitled.pen; nav labels from the
// Facts Panel frame's header. All pages render inside this.
const { data } = await useFetch('/api/data/apps')
const apps = computed<any[]>(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a: any) => a.verdict))
const issueNo = computed(() => String(scored.value.length).padStart(3, '0'))
const latest = computed(() =>
  [...scored.value].sort((a: any, b: any) => String(b.verified?.at ?? '').localeCompare(String(a.verified?.at ?? ''))))
const ticker = computed(() => latest.value.slice(0, 9))
const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '—'
</script>

<template>
  <div class="desk">
    <div class="backdrop" aria-hidden="true">
      <div class="glow glow-hero" />
      <div class="glow glow-lower" />
      <div class="gridline g1" /><div class="gridline g2" /><div class="gridline g3" /><div class="gridline g4" />
    </div>

    <header class="masthead">
      <div class="masthead-row">
        <div class="brand-row">
          <NuxtLink to="/" class="logo">shouldiselfhost<span class="q">?</span></NuxtLink>
          <span class="rule-v" />
          <span class="strapline">they tell you if you can — we tell you if you should</span>
        </div>
        <nav class="masthead-meta">
          <NuxtLink to="/" class="navlink">The roll</NuxtLink>
          <NuxtLink to="/vs" class="navlink">Compare</NuxtLink>
          <NuxtLink to="/stack" class="navlink">My stack</NuxtLink>
          <NuxtLink to="/methodology" class="navlink">The standard</NuxtLink>
          <a href="/api/apps.json" class="navlink">Data</a>
          <span class="sep">·</span>
          <span>ISSUE {{ issueNo }}</span>
        </nav>
      </div>
      <div class="running-head">
        <span>THE DECISION LAYER FOR SELF-HOSTING</span>
        <span>{{ apps.length }} APPS UNDER COVERAGE</span>
        <span>PROTOCOL v1</span>
        <span>NO VENDOR HAS EVER PAID FOR A RATING</span>
      </div>
      <div class="ticker">
        <span class="ticker-lead"><span class="live-dot" />RECENT ACTIONS</span>
        <template v-for="(t, i) in ticker" :key="t.id">
          <span v-if="i" class="sep">·</span>
          <NuxtLink :to="`/${t.id}`" class="tick">
            <span class="tick-mark" :class="t.verdict" />
            <span class="tick-app">{{ t.name.toUpperCase() }}</span>
            <span class="tick-grade" :class="t.verdict">{{ t.verdict === 'NOT_REALLY' ? 'NOT REALLY' : t.verdict }}</span>
          </NuxtLink>
        </template>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="colophon">
      <div class="colophon-top">
        <div class="colophon-brand">
          <div class="logo">shouldiselfhost<span class="q">?</span></div>
          <p>An independent ratings desk for self-hosted software. Ratings are opinions about cost, not advice about your infrastructure — and certainly not about your weekends.</p>
          <p class="ecosystem">The third leg of the stool: <a href="https://canivibecodeit.com">canivibecodeit</a> asks “can AI rebuild it?” · <a href="https://caniselfhostit.com">caniselfhostit</a> asks “can you run it?” · we ask “is it worth it?” Capability data seeded from <a href="https://github.com/caniselfhostit/caniselfhostit">caniselfhostit.com</a> (MIT, © Jashanpreet Singh).</p>
        </div>
        <div class="colophon-links">
          <div class="col">
            <div class="col-head">RATINGS</div>
            <NuxtLink to="/">The roll</NuxtLink>
            <NuxtLink to="/vs">Head-to-head</NuxtLink>
            <NuxtLink to="/stack">My stack</NuxtLink>
          </div>
          <div class="col">
            <div class="col-head">METHOD</div>
            <NuxtLink to="/methodology">The standard · protocol v1</NuxtLink>
            <a href="/api/apps.json">The data (JSON)</a>
            <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json">Changelog</a>
          </div>
          <div class="col">
            <div class="col-head">DESK</div>
            <a href="https://github.com/zernonia/shouldiselfhost/issues/new">Request a review</a>
            <a href="https://github.com/zernonia/shouldiselfhost/issues/new">File an appeal</a>
            <a href="https://github.com/zernonia/shouldiselfhost">Source (AGPL-3.0)</a>
          </div>
        </div>
      </div>
      <div class="rule-h" />
      <div class="appeals">
        <span class="appeals-label">APPEALS</span>
        <p>No vendor has ever paid for a rating and none ever will. A vendor who believes a rating is wrong may file for re-review with their own figures; we publish the outcome either way, including the times we were wrong.</p>
      </div>
      <div class="colophon-bottom">
        <span>Ratings data CC BY-SA 4.0 · site code AGPL-3.0</span>
        <span>they tell you if you can — we tell you if you should</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.navlink { font-size: 11.5px; letter-spacing: 0.4px; color: var(--d-t2); }
.navlink:hover, .navlink.router-link-active { color: var(--d-t1); }
.ecosystem { font-size: 12px !important; }
</style>
