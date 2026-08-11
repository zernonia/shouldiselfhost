<script setup lang="ts">
// Desk-styled newsletter signup — same D1-backed /api/subscribe as before.
const email = ref('')
const state = ref<'idle' | 'busy' | 'done' | 'error'>('idle')
const msg = ref('')

async function subscribe() {
  const value = email.value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    state.value = 'error'; msg.value = 'That doesn’t look like an email.'; return
  }
  state.value = 'busy'
  try {
    await $fetch('/api/subscribe', { method: 'POST', body: { email: value } })
    state.value = 'done'; msg.value = 'In. Worthy news only — promise.'
  } catch {
    state.value = 'error'; msg.value = 'Could not subscribe right now — try again in a minute.'
  }
}
</script>

<template>
  <div class="dispatch">
    <div class="roll-title">Worthy news only</div>
    <p class="roll-sub">New rating actions, price hikes turned into break-even math, and the occasional honest “keep paying”. We email when something is worth your weekend — which is rarer than newsletters like to admit. Unsubscribe is one click.</p>
    <form v-if="state !== 'done'" class="dispatch-row" @submit.prevent="subscribe">
      <label class="lookup">
        <span class="prompt">&gt;</span>
        <input v-model="email" type="email" placeholder="you@yourdomain.tld" autocomplete="email" :disabled="state === 'busy'" class="dispatch-input" />
      </label>
      <button class="chip submit" type="submit" :disabled="state === 'busy'">subscribe</button>
    </form>
    <p v-if="msg" class="feedback num" :class="state">{{ msg }}</p>
  </div>
</template>

<style scoped>
.dispatch { display: flex; flex-direction: column; gap: 16px; max-width: 620px; }
.dispatch .roll-sub { margin: 0; }
.dispatch-row { display: flex; gap: 10px; }
.dispatch-row .lookup { flex: 1; }
.dispatch-input { flex: 1; background: none; border: none; outline: none; color: var(--d-t1); font-family: var(--mono); font-size: 14px; padding: 0; border-radius: 0; }
.dispatch-input::placeholder { color: var(--d-t3); }
.chip.submit { cursor: pointer; background: var(--yes); border-color: var(--yes); color: var(--d-bg); font-weight: 600; }
.feedback { font-size: 12px; margin: 0; }
.feedback.done { color: var(--yes); }
.feedback.error { color: var(--no); }
@media (max-width: 560px) { .dispatch-row { flex-direction: column; } }
</style>
