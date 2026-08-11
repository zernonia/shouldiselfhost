<script setup lang="ts">
// Rating Tag — square mark + mono grade (frame z4digI).
const props = defineProps<{ verdict: 'YES' | 'KINDA' | 'NOT_REALLY' | null }>()
const color = computed(() =>
  props.verdict === 'YES' ? 'text-yes' : props.verdict === 'KINDA' ? 'text-kinda'
  : props.verdict === 'NOT_REALLY' ? 'text-no' : 'text-faint')
const mark = computed(() =>
  props.verdict === 'YES' ? 'bg-yes' : props.verdict === 'KINDA' ? 'bg-kinda'
  : props.verdict === 'NOT_REALLY' ? 'bg-no' : 'bg-faint')
const label = computed(() =>
  props.verdict === 'NOT_REALLY' ? 'NOT REALLY' : props.verdict ?? 'UNRATED')
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span class="size-2 shrink-0 rounded-[2px]" :class="mark" />
    <span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-[1.1px]" :class="color">{{ label }}</span>
  </span>
</template>
