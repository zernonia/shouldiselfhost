<script setup lang="ts">
// Screenshot of an alternative's real UI, captured from our own boot-verified
// compose instance (scripts/shoot-ui.mjs). Renders nothing if no shot exists.
const props = defineProps<{ id: string; name: string }>()
const failed = ref(false)
</script>

<template>
  <figure v-if="!failed" class="shell shot">
    <div class="core">
      <img
        :src="`/shots/${id}.webp`"
        :alt="`${name} running from the boot-verified compose file`"
        loading="lazy"
        @error="failed = true"
      />
      <figcaption class="dim">{{ name }}, running from the compose file on this page — screenshot from our verified instance, not marketing material.</figcaption>
    </div>
  </figure>
</template>

<style scoped>
.shot { margin: 0; }
.shot .core { padding: 0.6rem; }
.shot img {
  width: 100%; height: auto; display: block;
  border-radius: calc(var(--r-core) - 0.35rem);
  border: 1px solid var(--hairline-soft);
}
figcaption { font-size: 0.78rem; padding: 0.65rem 0.5rem 0.2rem; }
</style>
