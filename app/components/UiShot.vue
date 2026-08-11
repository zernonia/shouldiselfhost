<script setup lang="ts">
// Screenshot of an alternative's real UI, captured from our own boot-verified
// compose instance (scripts/shoot-ui.mjs). Renders nothing if no shot exists.
const props = defineProps<{ id: string; name: string }>()
const failed = ref(false)
</script>

<template>
  <figure v-if="!failed" class="m-0 border border-line bg-surface p-[10px]">
    <img
      :src="`/shots/${id}.webp`"
      :alt="`${name} running from the boot-verified compose file`"
      loading="lazy"
      class="block h-auto w-full border border-line"
      @error="failed = true"
    />
    <figcaption class="px-2 pb-1 pt-[10px] text-[11.5px] text-t3">{{ name }}, running from the compose file on this page — screenshot from our verified instance, not marketing material.</figcaption>
  </figure>
</template>
