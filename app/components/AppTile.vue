<script setup lang="ts">
// SaaS app tile: deterministic two-tone gradient monogram (no trademarked logos
// on the site that tells you to cancel the subscription — a tile is cleaner).
const props = defineProps<{ id: string; name: string; size?: number }>()
const HUES = [258, 152, 210, 330, 22, 190, 280, 120, 46, 350]
const hue = computed(() => {
  let h = 0
  for (const c of props.id) h = (h * 31 + c.charCodeAt(0)) % 997
  return HUES[h % HUES.length]
})
const px = computed(() => `${props.size ?? 40}px`)
const initials = computed(() => {
  const words = props.name.split(/[\s-]+/).filter(Boolean)
  return (words.length > 1 ? words[0]![0]! + words[1]![0]! : props.name.slice(0, 2)).toUpperCase()
})
</script>

<template>
  <span
    class="app-tile"
    :style="{
      width: px, height: px,
      background: `linear-gradient(135deg, hsl(${hue} 45% 22%), hsl(${(hue + 40) % 360} 55% 12%))`,
      color: `hsl(${hue} 70% 78%)`,
    }"
  >{{ initials }}</span>
</template>

<style scoped>
.app-tile {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 26%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.78em;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  user-select: none;
}
</style>
