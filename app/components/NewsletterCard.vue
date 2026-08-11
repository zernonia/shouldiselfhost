<script setup lang="ts">
// Client island like VoteButton: the only dynamic bits on a static page.
const email = ref('')
const state = ref<'idle' | 'busy' | 'done' | 'error'>('idle')
const msg = ref('')

async function subscribe() {
  const value = email.value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    state.value = 'error'
    msg.value = 'That doesn’t look like an email.'
    return
  }
  state.value = 'busy'
  try {
    await $fetch('/api/subscribe', { method: 'POST', body: { email: value } })
    state.value = 'done'
    msg.value = 'In. Worthy news only — promise.'
  } catch {
    state.value = 'error'
    msg.value = 'Could not subscribe right now — try again in a minute.'
  }
}
</script>

<template>
  <div class="shell">
    <div class="core letter">
      <span class="eyebrow">The newsletter</span>
      <h2>Worthy news only</h2>
      <p class="dim">
        New verdicts, subscription price hikes turned into break-even math, and the occasional
        honest “keep paying”. No weekly filler — we email when something is worth your weekend,
        which is rarer than newsletters like to admit. Unsubscribe is one click.
      </p>
      <form v-if="state !== 'done'" class="row" @submit.prevent="subscribe">
        <input v-model="email" type="email" placeholder="you@yourdomain.tld" autocomplete="email" :disabled="state === 'busy'" />
        <button class="btn primary" type="submit" :disabled="state === 'busy'">
          Subscribe <span class="ico">↗</span>
        </button>
      </form>
      <p v-if="msg" class="feedback" :class="state">{{ msg }}</p>
    </div>
  </div>
</template>

<style scoped>
.letter { display: flex; flex-direction: column; gap: 0.8rem; align-items: flex-start; }
.letter h2 { margin: 0; }
.letter p { margin: 0; max-width: 40rem; }
.row { display: flex; gap: 0.7rem; width: 100%; max-width: 30rem; margin-top: 0.4rem; }
.row input { flex: 1; }
.feedback { font-size: 0.85rem; }
.feedback.done { color: var(--yes); }
.feedback.error { color: var(--no); }
@media (max-width: 560px) {
  .row { flex-direction: column; }
}
</style>
