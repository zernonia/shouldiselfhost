<script setup lang="ts">
// Outlook Mark — trend arrow + mono label (design: frame NIakJ; lucide arrows,
// 12px, gap 6, label mono 10.5/+1). Outlook is an authored editorial field —
// apps without one render NOT ASSIGNED rather than an invented direction.
const props = defineProps<{ outlook?: 'positive' | 'stable' | 'negative' | null }>()
const color = computed(() =>
  props.outlook === 'positive' ? 'var(--yes)'
  : props.outlook === 'negative' ? 'var(--no)'
  : props.outlook === 'stable' ? 'var(--text-2, var(--text-dim))' : 'var(--text-faint)')
const label = computed(() => (props.outlook ?? 'not assigned').toUpperCase())
// lucide arrow-up-right / arrow-right / arrow-down-right paths (24-unit grid)
const path = computed(() =>
  props.outlook === 'positive' ? 'M7 17 17 7M7 7h10v10'
  : props.outlook === 'negative' ? 'M7 7l10 10M17 7v10H7'
  : 'M5 12h14m-6-6 6 6-6 6')
</script>

<template>
  <span class="outlook-mark" :style="{ color }">
    <svg v-if="outlook" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path :d="path" />
    </svg>
    <span class="label">{{ label }}</span>
  </span>
</template>

<style scoped>
.outlook-mark { display: inline-flex; align-items: center; gap: 6px; }
.label { font-family: var(--mono); font-size: 10.5px; letter-spacing: 1px; white-space: nowrap; }
</style>
