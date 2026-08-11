<script setup lang="ts">
// Rating Badge — desk-style verdict mark (design: frame r0Y3fU in untitled.pen).
// Values from the document: radius 5, fill = verdict @ 8% alpha, stroke @ 20%,
// mono 10px/600/+0.8 tracking.
const props = defineProps<{ verdict: 'YES' | 'KINDA' | 'NOT_REALLY' | null }>()
const label = computed(() =>
  props.verdict === 'NOT_REALLY' ? 'NOT REALLY' : props.verdict ?? 'UNRATED')
</script>

<template>
  <span class="rating-badge" :class="verdict ?? 'UNRATED'">{{ label }}</span>
</template>

<style scoped>
.rating-badge {
  display: inline-flex; align-items: center;
  padding: 5px 9px;
  border-radius: 5px;
  border: 1px solid;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  white-space: nowrap;
}
.YES { color: var(--yes); background: #34d39914; border-color: #34d39933; }
.KINDA { color: var(--kinda); background: #fbbf2414; border-color: #fbbf2433; }
.NOT_REALLY { color: var(--no); background: #fb718514; border-color: #fb718533; }
.UNRATED { color: var(--text-faint); background: transparent; border-color: var(--hairline-soft); }
</style>
