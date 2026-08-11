<script setup lang="ts">
import { dk } from '~/composables/deskClasses'
const { data: pairs } = await useFetch('/api/data/vs')
useHead({ title: 'Head-to-head comparisons' })
</script>

<template>
  <section :class="dk.row" class="pt-[54px]!">
    <div :class="dk.gutter">
      <div :class="dk.secNo">VS</div>
      <div :class="dk.secName">COMPARE</div>
    </div>
    <div :class="dk.body">
      <div :class="dk.rollTitle">Head-to-head</div>
      <p :class="dk.rollSub">Two tools competing for the same jobs, compared on data: freshness, resources, and the rating pages each one backs. Currently served by year-old Reddit threads; we'd rather serve you numbers.</p>
      <div class="flex flex-col">
        <NuxtLink v-for="p in pairs ?? []" :key="p.slug" :to="`/vs/${p.slug}`" class="group flex items-baseline justify-between gap-5 border-b border-surface-2 py-3">
          <span class="text-[14px]"><strong class="font-semibold text-t1 transition-colors group-hover:text-yes">{{ p.a.name }}</strong><span class="italic text-t3"> vs </span><strong class="font-semibold text-t1 transition-colors group-hover:text-yes">{{ p.b.name }}</strong></span>
          <span v-if="p.category" class="font-mono text-[10.5px] tracking-[0.8px] text-faint">{{ p.category }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
