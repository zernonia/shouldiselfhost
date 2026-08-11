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
  <button
    class="inline-flex cursor-pointer items-center gap-[9px] rounded-[6px] border px-[13px] py-[9px] font-mono text-[10.5px] font-semibold tracking-[1px] transition-colors"
    :class="voted ? 'border-yes bg-yes/5 text-yes' : 'border-line text-t2 hover:border-yes hover:text-t1'"
    :disabled="busy"
    @click="toggle"
  >
    ✋ I SWAPPED THIS
    <span v-if="count != null" class="font-mono tabular-nums font-bold text-yes">{{ count }}</span>
  </button>
</template>
