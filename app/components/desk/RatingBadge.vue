<script setup lang="ts">
// Rating Badge — desk-style verdict mark (frame r0Y3fU in untitled.pen).
const props = defineProps<{ verdict: 'YES' | 'KINDA' | 'NOT_REALLY' | null }>()
const label = computed(() =>
  props.verdict === 'NOT_REALLY' ? 'NOT REALLY' : props.verdict ?? 'UNRATED')
const cls = computed(() =>
  props.verdict === 'YES' ? 'text-yes bg-yes/10 border-yes/20'
  : props.verdict === 'KINDA' ? 'text-kinda bg-kinda/10 border-kinda/20'
  : props.verdict === 'NOT_REALLY' ? 'text-no bg-no/10 border-no/20'
  : 'text-faint border-line')
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap rounded-[5px] border px-[9px] py-[5px] font-mono text-[10px] font-semibold tracking-[0.8px]"
    :class="cls"
  >{{ label }}</span>
</template>
