<script setup lang="ts">
const props = defineProps<{ verdict: string | null; stale?: boolean; small?: boolean }>()
const label = computed(() =>
  props.verdict === 'YES' ? 'YES'
  : props.verdict === 'KINDA' ? 'KINDA'
  : props.verdict === 'NOT_REALLY' ? 'NOT REALLY'
  : 'NOT SCORED YET')
const subtitle = computed(() =>
  props.verdict === 'YES' ? 'worth it'
  : props.verdict === 'KINDA' ? 'worth it if…'
  : props.verdict === 'NOT_REALLY' ? 'keep paying'
  : '')
</script>

<template>
  <span class="badge" :class="[verdict ?? 'UNSCORED', { stale, small }]" :title="stale ? 'Verified over 12 months ago — needs a re-test' : undefined">
    {{ label }}<small v-if="subtitle && !small" class="sub">{{ subtitle }}</small><span v-if="stale">⏳</span>
  </span>
</template>

<style scoped>
.sub { font-weight: 400; opacity: 0.75; font-size: 0.7em; }
</style>
