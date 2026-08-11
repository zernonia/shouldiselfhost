<script setup lang="ts">
// Rating Tag — square mark + mono grade (design: frame z4digI).
// 8px mark radius 2, gap 8; label mono 11px/600/+1.1.
const props = defineProps<{ verdict: 'YES' | 'KINDA' | 'NOT_REALLY' | null }>()
const color = computed(() =>
  props.verdict === 'YES' ? 'var(--yes)' : props.verdict === 'KINDA' ? 'var(--kinda)'
  : props.verdict === 'NOT_REALLY' ? 'var(--no)' : 'var(--text-faint)')
const label = computed(() =>
  props.verdict === 'NOT_REALLY' ? 'NOT REALLY' : props.verdict ?? 'UNRATED')
</script>

<template>
  <span class="rating-tag">
    <span class="mark" :style="{ background: color }" />
    <span class="grade" :style="{ color }">{{ label }}</span>
  </span>
</template>

<style scoped>
.rating-tag { display: inline-flex; align-items: center; gap: 8px; }
.mark { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.grade { font-family: var(--mono); font-size: 11px; font-weight: 600; letter-spacing: 1.1px; white-space: nowrap; }
</style>
