<script setup lang="ts">
// App Avatar — verdict-tinted entity tile (frame PdzNv); real logo with
// initials fallback.
const props = defineProps<{ id: string; name: string; verdict?: string | null; size?: number }>()
const stage = ref<'svg' | 'png' | 'initials'>('svg')
const px = computed(() => `${props.size ?? 36}px`)
const tint = computed(() =>
  props.verdict === 'YES' ? '#34d399' : props.verdict === 'KINDA' ? '#fbbf24'
  : props.verdict === 'NOT_REALLY' ? '#fb7185' : '#5c616b')
const initials = computed(() => {
  const words = props.name.split(/[\s-]+/).filter(Boolean)
  return (words.length > 1 ? words[0]![0]! + words[1]![0]! : props.name.slice(0, 2)).toUpperCase()
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border"
    :style="{ width: px, height: px, background: tint + '14', borderColor: tint + '26' }"
  >
    <img v-if="stage === 'svg'" :src="`/logos/apps/${id}.svg`" :alt="`${name} logo`" loading="lazy" class="size-[72%] rounded-[6px] object-contain" @error="stage = 'png'" />
    <img v-else-if="stage === 'png'" :src="`/logos/apps/${id}.png`" :alt="`${name} logo`" loading="lazy" class="size-[72%] rounded-[6px] object-cover" @error="stage = 'initials'" />
    <span v-else class="font-mono text-[12px] font-bold tracking-[0.4px]" :style="{ color: tint }">{{ initials }}</span>
  </span>
</template>
