<script setup lang="ts">
// SaaS app logo. Resolution order: brand-mark SVG (simple-icons, build-generated)
// → official GitHub org avatar (fetched at build) → gradient monogram tile.
const props = defineProps<{ id: string; name: string; size?: number }>()
const stage = ref<'svg' | 'png' | 'tile'>('svg')
const px = computed(() => `${props.size ?? 40}px`)

const HUES = [258, 152, 210, 330, 22, 190, 280, 120, 46, 350]
const hue = computed(() => {
  let h = 0
  for (const c of props.id) h = (h * 31 + c.charCodeAt(0)) % 997
  return HUES[h % HUES.length]
})
const initials = computed(() => {
  const words = props.name.split(/[\s-]+/).filter(Boolean)
  return (words.length > 1 ? words[0]![0]! + words[1]![0]! : props.name.slice(0, 2)).toUpperCase()
})
</script>

<template>
  <span class="app-tile" :style="{ width: px, height: px }">
    <img
      v-if="stage === 'svg'"
      :src="`/logos/apps/${id}.svg`"
      :alt="`${name} logo`"
      loading="lazy"
      @error="stage = 'png'"
    />
    <img
      v-else-if="stage === 'png'"
      :src="`/logos/apps/${id}.png`"
      :alt="`${name} logo`"
      loading="lazy"
      class="avatar"
      @error="stage = 'tile'"
    />
    <span
      v-else
      class="mono"
      :style="{
        background: `linear-gradient(135deg, hsl(${hue} 45% 22%), hsl(${(hue + 40) % 360} 55% 12%))`,
        color: `hsl(${hue} 70% 78%)`,
      }"
    >{{ initials }}</span>
  </span>
</template>

<style scoped>
.app-tile { display: inline-flex; flex-shrink: 0; }
.app-tile img { width: 100%; height: 100%; display: block; }
.app-tile img.avatar { border-radius: 26%; border: 1px solid rgba(255, 255, 255, 0.1); object-fit: cover; }
.mono {
  width: 100%; height: 100%;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 26%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.78em;
  user-select: none;
}
</style>
