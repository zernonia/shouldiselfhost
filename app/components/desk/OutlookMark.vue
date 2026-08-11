<script setup lang="ts">
// Outlook Mark — trend arrow + mono label (frame NIakJ). Authored editorial
// field; apps without one render NOT ASSIGNED, never an invented direction.
const props = defineProps<{ outlook?: 'positive' | 'stable' | 'negative' | null }>()
const cls = computed(() =>
  props.outlook === 'positive' ? 'text-yes'
  : props.outlook === 'negative' ? 'text-no'
  : props.outlook === 'stable' ? 'text-t2' : 'text-faint')
const label = computed(() => (props.outlook ?? 'not assigned').toUpperCase())
const path = computed(() =>
  props.outlook === 'positive' ? 'M7 17 17 7M7 7h10v10'
  : props.outlook === 'negative' ? 'M7 7l10 10M17 7v10H7'
  : 'M5 12h14m-6-6 6 6-6 6')
</script>

<template>
  <span class="inline-flex items-center gap-[6px]" :class="cls">
    <svg v-if="outlook" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path :d="path" />
    </svg>
    <span class="whitespace-nowrap font-mono text-[10.5px] tracking-[1px]">{{ label }}</span>
  </span>
</template>
