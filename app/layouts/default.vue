<script setup lang="ts">
// Desk chrome — masthead, running head, live actions ticker, colophon.
// Full-bleed hairlines; content capped at 1240px. Pure Tailwind utilities.
import { dk, verdictBg, verdictText, verdictLabel } from '~/composables/deskClasses'

const { data } = await useFetch('/api/data/apps')
const apps = computed<any[]>(() => data.value?.apps ?? [])
const scored = computed(() => apps.value.filter((a: any) => a.verdict))
const issueNo = computed(() => String(scored.value.length).padStart(3, '0'))
const ticker = computed(() =>
  [...scored.value]
    .sort((a: any, b: any) => String(b.verified?.at ?? '').localeCompare(String(a.verified?.at ?? '')))
    .slice(0, 9))

const cap = 'mx-auto max-w-[1240px] px-5'
const navlink = 'transition-colors hover:text-t1 aria-[current=page]:text-t1'
const colHead = 'font-mono text-[9.5px] tracking-[1.3px] text-faint'
const colLink = 'text-[13px] text-t2 transition-colors hover:text-t1'
</script>

<template>
  <div class="relative overflow-clip bg-bg text-t1">
    <!-- Backdrop: glows + gutter rules spanning full page height at the 1240 cap's column edges -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -top-[380px] left-1/2 h-[1020px] w-[1240px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#34D3991F,#34D39900)]" />
      <div class="absolute -bottom-[200px] -right-[300px] h-[900px] w-[1100px] rounded-full bg-[radial-gradient(closest-side,#FB718514,#FB718500)]" />
      <div class="absolute inset-y-0 w-px bg-[#1C212A] max-[900px]:hidden" style="left: var(--cap-left)" />
      <div class="absolute inset-y-0 w-px bg-[#12161C] max-[900px]:hidden" style="left: calc(var(--cap-left) + 110px)" />
      <div class="absolute inset-y-0 w-px bg-[#1C212A] max-[900px]:hidden" style="left: calc(var(--cap-left) + 152px)" />
      <div class="absolute inset-y-0 w-px bg-[#1A1F27] max-[900px]:hidden" style="right: var(--cap-left)" />
    </div>

    <header class="relative border-b border-line">
      <div class="border-b border-line">
        <div :class="cap" class="flex flex-wrap items-center justify-between gap-x-10 gap-y-2 py-[19px]">
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="font-mono text-[15px] font-bold tracking-[-0.3px] text-t1">shouldiselfhost<span class="text-yes">?</span></NuxtLink>
            <span class="h-[15px] w-px bg-line" />
            <span class="font-mono text-[11px] text-t3 max-[700px]:hidden">they tell you if you can — we tell you if you should</span>
          </div>
          <nav class="flex items-center gap-[18px] font-mono text-[11px] tracking-[0.8px] text-t3">
            <NuxtLink to="/" :class="navlink">The roll</NuxtLink>
            <NuxtLink to="/vs" :class="navlink">Compare</NuxtLink>
            <NuxtLink to="/stack" :class="navlink">My stack</NuxtLink>
            <NuxtLink to="/methodology" :class="navlink">The standard</NuxtLink>
            <a href="/api/apps.json" :class="navlink">Data</a>
            <span class="text-dim">·</span>
            <span>ISSUE {{ issueNo }}</span>
          </nav>
        </div>
      </div>
      <div class="border-b border-line bg-[#0B0C0FB3]">
        <div :class="cap" class="flex flex-wrap justify-between gap-x-[30px] gap-y-1 py-[9px] font-mono text-[10px] tracking-[1.3px] text-t3">
          <span>THE DECISION LAYER FOR SELF-HOSTING</span>
          <span>{{ apps.length }} APPS UNDER COVERAGE</span>
          <span>PROTOCOL v1</span>
          <span class="max-[900px]:hidden">NO VENDOR HAS EVER PAID FOR A RATING</span>
        </div>
      </div>
      <div class="bg-[#0B0C0FB3]">
        <div :class="cap" class="flex items-center overflow-x-auto py-[11px] font-mono [scrollbar-width:none]">
          <span class="inline-flex items-center gap-2 whitespace-nowrap pr-5 text-[10px] font-semibold tracking-[1.3px] text-t2">
            <span class="size-[5px] rounded-full bg-yes" />RECENT ACTIONS
          </span>
          <template v-for="(t, i) in ticker" :key="t.id">
            <span v-if="i" class="text-dim">·</span>
            <NuxtLink :to="`/${t.id}`" class="inline-flex items-center gap-[7px] whitespace-nowrap px-[13px]">
              <span class="size-[5px]" :class="verdictBg(t.verdict)" />
              <span class="text-[10px] tracking-[0.9px] text-t2">{{ t.name.toUpperCase() }}</span>
              <span class="text-[10px] tracking-[0.9px]" :class="verdictText(t.verdict)">{{ verdictLabel(t.verdict) }}</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="relative">
      <slot />
    </main>

    <footer class="relative border-t border-line">
      <div :class="cap" class="flex flex-col gap-9 pb-11 pt-[54px]">
        <div class="flex flex-wrap justify-between gap-x-20 gap-y-8">
          <div class="flex max-w-[460px] flex-col gap-[14px]">
            <div class="font-mono text-[14px] font-bold tracking-[-0.3px] text-t1">shouldiselfhost<span class="text-yes">?</span></div>
            <p class="m-0 text-[13px] leading-[1.65] text-t3">An independent ratings desk for self-hosted software. Ratings are opinions about cost, not advice about your infrastructure — and certainly not about your weekends.</p>
            <p class="m-0 text-[12px] leading-[1.65] text-t3">The third leg of the stool: <a href="https://canivibecodeit.com" class="text-t2 underline">canivibecodeit</a> asks “can AI rebuild it?” · <a href="https://caniselfhostit.com" class="text-t2 underline">caniselfhostit</a> asks “can you run it?” · we ask “is it worth it?” Capability data seeded from <a href="https://github.com/caniselfhostit/caniselfhostit" class="text-t2 underline">caniselfhostit.com</a> (MIT, © Jashanpreet Singh).</p>
          </div>
          <div class="flex flex-wrap gap-[60px]">
            <div class="flex flex-col gap-3">
              <div :class="colHead">RATINGS</div>
              <NuxtLink to="/" :class="colLink">The roll</NuxtLink>
              <NuxtLink to="/vs" :class="colLink">Head-to-head</NuxtLink>
              <NuxtLink to="/stack" :class="colLink">My stack</NuxtLink>
            </div>
            <div class="flex flex-col gap-3">
              <div :class="colHead">METHOD</div>
              <NuxtLink to="/methodology" :class="colLink">The standard · protocol v1</NuxtLink>
              <a href="/api/apps.json" :class="colLink">The data (JSON)</a>
              <a href="https://github.com/zernonia/shouldiselfhost/blob/main/data/changelog.json" :class="colLink">Changelog</a>
            </div>
            <div class="flex flex-col gap-3">
              <div :class="colHead">DESK</div>
              <a href="https://github.com/zernonia/shouldiselfhost/issues/new" :class="colLink">Request a review</a>
              <a href="https://github.com/zernonia/shouldiselfhost/issues/new" :class="colLink">File an appeal</a>
              <a href="https://github.com/zernonia/shouldiselfhost" :class="colLink">Source (AGPL-3.0)</a>
            </div>
          </div>
        </div>
        <div :class="dk.ruleH" />
        <div class="flex flex-wrap items-baseline gap-[14px]">
          <span class="font-mono text-[9.5px] tracking-[1.3px] text-yes">APPEALS</span>
          <p class="m-0 max-w-[820px] text-[13px] leading-[1.65] text-t3">No vendor has ever paid for a rating and none ever will. A vendor who believes a rating is wrong may file for re-review with their own figures; we publish the outcome either way, including the times we were wrong.</p>
        </div>
        <div class="flex flex-wrap justify-between gap-10 font-mono text-[11px] text-faint">
          <span>Ratings data CC BY-SA 4.0 · site code AGPL-3.0</span>
          <span>they tell you if you can — we tell you if you should</span>
        </div>
      </div>
    </footer>
  </div>
</template>
