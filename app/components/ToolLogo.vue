<script setup lang="ts">
// OSS alternative logo: vendored GitHub avatar (public/logos/{id}.png),
// falling back to a letter tile if the file is missing.
const props = defineProps<{ id: string; name: string; size?: number }>()
const failed = ref(false)
const px = computed(() => `${props.size ?? 40}px`)
</script>

<template>
  <span class="tool-logo" :style="{ width: px, height: px }">
    <img
      v-if="!failed"
      :src="`/logos/${id}.png`"
      :alt="`${name} logo`"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else class="fallback">{{ name.slice(0, 1).toUpperCase() }}</span>
  </span>
</template>

<style scoped>
.tool-logo {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 26%;
  overflow: hidden;
  background: var(--panel-strong);
  border: 1px solid var(--hairline-soft);
  flex-shrink: 0;
}
.tool-logo img { width: 100%; height: 100%; object-fit: cover; }
.fallback { font-family: var(--display); font-weight: 700; color: var(--text-dim); font-size: 0.9em; }
</style>
