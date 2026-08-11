<script setup lang="ts">
// OSS alternative logo: vendored GitHub avatar (public/logos/{id}.png),
// falling back to a letter tile if the file is missing.
const props = defineProps<{ id: string; name: string; size?: number }>()
const failed = ref(false)
const px = computed(() => `${props.size ?? 40}px`)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[26%] border border-line bg-surface-2"
    :style="{ width: px, height: px }"
  >
    <img v-if="!failed" :src="`/logos/${id}.png`" :alt="`${name} logo`" loading="lazy" class="h-full w-full object-cover" @error="failed = true" />
    <span v-else class="font-display text-[0.9em] font-bold text-t2">{{ name.slice(0, 1).toUpperCase() }}</span>
  </span>
</template>
