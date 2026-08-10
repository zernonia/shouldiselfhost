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
  <button class="btn vote" :class="{ voted }" :disabled="busy" @click="toggle">
    ✋ I self-host this
    <span v-if="count != null" class="ico num">{{ count }}</span>
  </button>
</template>

<style scoped>
.vote.voted { border-color: rgba(52, 211, 153, 0.5); color: var(--yes); }
.vote.voted .ico { background: rgba(52, 211, 153, 0.15); }
.vote .ico { width: auto; min-width: 1.9em; padding: 0 0.5em; font-size: 0.82em; }
</style>
