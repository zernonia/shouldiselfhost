<script setup lang="ts">
// App Avatar — desk-style entity tile (design: frame PdzNv). Verdict-tinted
// frame (radius 10, fill @ 8%, stroke @ 15%); shows the app's real logo where
// we have one (the design's initials are the fallback, not the default).
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
    class="app-avatar"
    :style="{ width: px, height: px, background: tint + '14', borderColor: tint + '26' }"
  >
    <img v-if="stage === 'svg'" :src="`/logos/apps/${id}.svg`" :alt="`${name} logo`" loading="lazy" @error="stage = 'png'" />
    <img v-else-if="stage === 'png'" :src="`/logos/apps/${id}.png`" :alt="`${name} logo`" loading="lazy" @error="stage = 'initials'" />
    <span v-else class="initials" :style="{ color: tint }">{{ initials }}</span>
  </span>
</template>

<style scoped>
.app-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px;
  border: 1px solid;
  overflow: hidden;
  flex-shrink: 0;
}
.app-avatar img { width: 72%; height: 72%; object-fit: contain; border-radius: 6px; }
.initials { font-family: var(--mono); font-size: 12px; font-weight: 700; letter-spacing: 0.4px; }
</style>
