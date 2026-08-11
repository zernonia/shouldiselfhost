<script setup lang="ts">
// Desk chrome — masthead, running head, live actions ticker, colophon.
// Full-bleed hairlines; content capped at 1240px via .page-cap.
const { data } = await useFetch('/api/data/apps')
const apps = computed<any[]>(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a: any) => a.verdict))
const issueNo = computed(() => String(scored.value.length).padStart(3, '0'))
const ticker = computed(() =>
  [...scored.value]
    .sort((a: any, b: any) => String(b.verified?.at ?? '').localeCompare(String(a.verified?.at ?? '')))
    .slice(0, 9))
</script>

<template>
  <div class="relative overflow-clip bg-bg text-t1">
    <div class="backdrop" aria-hidden="true">
      <div class="glow glow-hero" />
      <div class="glow glow-lower" />
      <div class="gridline g1" /><div class="gridline g2" /><div class="gridline g3" /><div class="gridline g4" />
    </div>

    <header class="relative border-b border-line">
      <div class="border-b border-line">
        <div class="page-cap masthead-row border-b-0">
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="logo">shouldiselfhost<span class="q">?</span></NuxtLink>
            <span class="rule-v" />
            <span class="strapline max-[700px]:hidden">they tell you if you can — we tell you if you should</span>
          </div>
          <nav class="flex items-center gap-[18px] font-mono text-[11px] tracking-[0.8px] text-t3">
            <NuxtLink to="/" class="navlink">The roll</NuxtLink>
            <NuxtLink to="/vs" class="navlink">Compare</NuxtLink>
            <NuxtLink to="/stack" class="navlink">My stack</NuxtLink>
            <NuxtLink to="/methodology" class="navlink">The standard</NuxtLink>
            <a href="/api/apps.json" class="navlink">Data</a>
            <span class="sep">·</span>
            <span>ISSUE {{ issueNo }}</span>
          </nav>
        </div>
      </div>
      <div class="border-b border-line bg-[#0B0C0FB3]">
        <div class="page-cap running-head border-b-0">
          <span>THE DECISION LAYER FOR SELF-HOSTING</span>
          <span>{{ apps.length }} APPS UNDER COVERAGE</span>
          <span>PROTOCOL v1</span>
          <span class="max-[900px]:hidden">NO VENDOR HAS EVER PAID FOR A RATING</span>
        </div>
      </div>
      <div class="bg-[#0B0C0FB3]">
        <div class="page-cap ticker">
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
      </div>
    </header>

    <main class="relative">
      <slot />
    </main>

    <footer class="relative border-t border-line">
      <div class="page-cap colophon">
        <div class="colophon-top">
          <div class="colophon-brand">
            <div class="logo">shouldiselfhost<span class="q">?</span></div>
            <p>An independent ratings desk for self-hosted software. Ratings are opinions about cost, not advice about your infrastructure — and certainly not about your weekends.</p>
            <p class="!text-[12px]">The third leg of the stool: <a href="https://canivibecodeit.com" class="text-t2 underline">canivibecodeit</a> asks “can AI rebuild it?” · <a href="https://caniselfhostit.com" class="text-t2 underline">caniselfhostit</a> asks “can you run it?” · we ask “is it worth it?” Capability data seeded from <a href="https://github.com/caniselfhostit/caniselfhostit" class="text-t2 underline">caniselfhostit.com</a> (MIT, © Jashanpreet Singh).</p>
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
      </div>
    </footer>
  </div>
</template>

<style scoped>
.navlink:hover, .navlink.router-link-active { color: var(--color-t1); }
</style>
