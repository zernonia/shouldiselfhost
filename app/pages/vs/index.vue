<script setup lang="ts">
const { data: pairs } = await useFetch('/api/data/vs')
useHead({ title: 'Head-to-head comparisons' })
</script>

<template>
  <div>
    <span v-reveal class="eyebrow">Compared on data</span>
    <h1 v-reveal="1">Head-to-head</h1>
    <p class="dim">
      Two tools competing for the same jobs, compared on data: freshness, resources, and the
      verdict pages each one backs. Currently served by year-old Reddit threads; we'd rather
      serve you numbers.
    </p>
    <div class="grid">
      <NuxtLink v-for="p in pairs ?? []" :key="p.slug" :to="`/vs/${p.slug}`" class="card pair">
        <strong>{{ p.a.name }}</strong><span class="dim"> vs </span><strong>{{ p.b.name }}</strong>
        <span v-if="p.category" class="dim cat">{{ p.category }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; margin-top: 1.2rem; }
.pair { color: var(--text); display: flex; flex-wrap: wrap; gap: 0.35em; align-items: baseline; }
.pair:hover { text-decoration: none; border-color: var(--accent); }
.cat { font-size: 0.75rem; margin-left: auto; }
</style>
