<script setup lang="ts">
// Desk-styled newsletter signup — same D1-backed /api/subscribe as before.
import { dk } from '~/composables/deskClasses'
const email = ref('')
const state = ref<'idle' | 'busy' | 'done' | 'error'>('idle')
const msg = ref('')

async function subscribe() {
  const value = email.value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    state.value = 'error'; msg.value = 'That doesn\u2019t look like an email.'; return
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
  <div class="flex max-w-[620px] flex-col gap-4">
    <div :class="dk.rollTitle">Worthy news only</div>
    <p :class="dk.rollSub">New rating actions, price hikes turned into break-even math, and the occasional honest “keep paying”. We email when something is worth your weekend — which is rarer than newsletters like to admit. Unsubscribe is one click.</p>
    <form v-if="state !== 'done'" class="flex gap-[10px] max-[560px]:flex-col" @submit.prevent="subscribe">
      <label class="flex flex-1 items-center gap-[10px] border border-line bg-surface px-4 py-[14px] font-mono">
        <span class="text-sm font-bold text-yes">&gt;</span>
        <input v-model="email" type="email" placeholder="you@yourdomain.tld" autocomplete="email" :disabled="state === 'busy'" class="flex-1 border-none bg-transparent p-0 font-mono text-sm text-t1 outline-none placeholder:text-t3" />
      </label>
      <button :class="dk.chip" class="border-yes! bg-yes font-semibold text-bg! hover:text-bg!" type="submit" :disabled="state === 'busy'">subscribe</button>
    </form>
    <p v-if="msg" class="m-0 font-mono text-[12px]" :class="state === 'done' ? 'text-yes' : 'text-no'">{{ msg }}</p>
  </div>
</template>
