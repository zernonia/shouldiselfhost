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
    ✋ I self-host this
    <span v-if="count != null" class="num">{{ count }}</span>
  </button>
</template>

<style scoped>
.vote {
  font: inherit; cursor: pointer; color: var(--text);
  background: var(--bg-raise); border: 1px solid var(--border); border-radius: 8px;
  padding: 0.45em 0.9em; display: inline-flex; gap: 0.6em; align-items: center;
}
.vote:hover { border-color: var(--accent); }
.vote.voted { border-color: var(--yes); color: var(--yes); }
.num { color: var(--accent); }
</style>
