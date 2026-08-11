<script setup lang="ts">
const { data: pairs } = await useFetch('/api/data/vs')
useHead({ title: 'Head-to-head comparisons' })
</script>

<template>
  <section class="row hero-row">
    <div class="gutter">
      <div class="sec-no">VS</div>
      <div class="sec-name">COMPARE</div>
    </div>
    <div class="body">
      <div class="roll-title">Head-to-head</div>
      <p class="roll-sub">Two tools competing for the same jobs, compared on data: freshness, resources, and the rating pages each one backs. Currently served by year-old Reddit threads; we'd rather serve you numbers.</p>
      <div class="pair-rows">
        <NuxtLink v-for="p in pairs ?? []" :key="p.slug" :to="`/vs/${p.slug}`" class="pair-row">
          <span class="pair-names"><strong>{{ p.a.name }}</strong><span class="vs-sep"> vs </span><strong>{{ p.b.name }}</strong></span>
          <span v-if="p.category" class="pair-cat num">{{ p.category }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-row { padding-top: 54px; }
.pair-rows { display: flex; flex-direction: column; }
.pair-row { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; padding: 12px 0; border-bottom: 1px solid var(--d-surface-2); color: var(--d-t1); }
.pair-row:hover strong { color: var(--yes); }
.pair-row strong { font-size: 14px; font-weight: 600; transition: color 0.3s var(--ease); }
.vs-sep { color: var(--d-t3); font-style: italic; font-size: 13px; }
.pair-cat { font-size: 10.5px; letter-spacing: 0.8px; color: var(--d-faint); }
</style>
