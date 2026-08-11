<script setup lang="ts">
// Client island: votes are the only dynamic thing on an otherwise static page.
// Display-only by design — no vote has ever changed a verdict (see /methodology).
const props = defineProps<{ appId: string }>()
const count = ref<number | null>(null)
const voted = ref(false)
const busy = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch<{ votes: Record<string, number> }>('/api/votes')
    count.value = data.votes[props.appId] ?? 0
  } catch { count.value = null }
})

async function toggle() {
  if (busy.value) return
  busy.value = true
  try {
    const res = await $fetch<{ count: number; voted: boolean }>('/api/vote', {
      method: 'POST',
      body: { app: props.appId },
    })
    count.value = res.count
    voted.value = res.voted
  } catch { /* static preview or API down — leave the count as-is */ }
  busy.value = false
}
</script>

<template>
  <button class="vote" :class="{ voted }" :disabled="busy" @click="toggle">
    ✋ I SWAPPED THIS
    <span v-if="count != null" class="count num">{{ count }}</span>
  </button>
</template>

<style scoped>
.vote {
  display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
  font-family: var(--mono); font-size: 10.5px; font-weight: 600; letter-spacing: 1px;
  color: var(--d-t2); background: none;
  border: 1px solid var(--d-border); border-radius: 6px; padding: 9px 13px;
  transition: border-color 0.3s var(--ease), color 0.3s var(--ease);
}
.vote:hover { border-color: var(--yes); color: var(--d-t1); }
.vote.voted { border-color: var(--yes); color: var(--yes); background: #34D3990D; }
.vote .count { color: var(--yes); font-weight: 700; }
</style>
