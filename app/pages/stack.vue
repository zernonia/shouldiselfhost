<script setup lang="ts">
// Stack flex page: pick what you self-host, get the number, share the URL.
// Selection lives in the query string (?apps=a,b,c) so a share link reproduces the stack —
// no accounts, no server state. r/selfhosted's favorite genre, given a scoreboard.
import { dk } from '~/composables/deskClasses'

const { data } = await useFetch('/api/data/apps')
const route = useRoute()
const router = useRouter()

const apps = computed(() => (data.value?.apps ?? []).slice().sort((a: any, b: any) => a.name.localeCompare(b.name)))
const selected = ref<Set<string>>(new Set(
  String(route.query.apps ?? '').split(',').filter(Boolean),
))

function toggle(id: string) {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
  router.replace({ query: next.size ? { apps: [...next].join(',') } : {} })
}

const picked = computed(() => apps.value.filter((a: any) => selected.value.has(a.id)))
const totalPrice = computed(() => picked.value.reduce((s: number, a: any) => s + a.price_usd_mo, 0))
const totalCost = computed(() => picked.value.reduce((s: number, a: any) => s + (a.derived.self_host_cost_usd_mo ?? 0), 0))
const totalSaving = computed(() => totalPrice.value - totalCost.value)

const copied = ref(false)
async function share() {
  const url = `https://shouldiselfhost.com/stack?apps=${[...selected.value].join(',')}`
  const text = `My homelab replaces $${totalPrice.value.toFixed(2)}/mo of subscriptions (${picked.value.map((a: any) => a.name).join(', ')}) — net saving $${totalSaving.value.toFixed(2)}/mo after honest costs. ${url}`
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}

useHead({ title: 'My stack — what does your homelab replace?' })
useSeoMeta({
  description: 'Pick what you self-host, get the honest number: subscriptions escaped per month, net of server costs and your maintenance time.',
})
</script>

<template>
  <section :class="dk.row" class="pt-[54px]!">
    <div :class="dk.gutter">
      <div :class="dk.secNo">MY</div>
      <div :class="dk.secName">STACK</div>
    </div>
    <div :class="dk.body">
    <div class="font-display text-[clamp(26px,3vw,40px)] font-medium tracking-[-1.5px] text-t1">My homelab replaces…</div>
    <p :class="dk.rollSub">
      Pick what you actually self-host. The math is the same honest math as everywhere else on
      this site — subscription prices minus server share, storage, and your time at the
      reference rate. Share link carries your whole stack.
    </p>

    <div class="sticky top-2 z-10 flex flex-wrap items-center gap-8 border border-line bg-surface px-[18px] py-4">
      <div class="flex flex-col">
        <span class="font-mono text-[11px] uppercase tracking-[1px] text-t3">subscriptions escaped</span>
        <strong class="font-display text-[1.4rem] tabular-nums text-yes">${{ totalPrice.toFixed(2) }}/mo</strong>
      </div>
      <div class="flex flex-col">
        <span class="font-mono text-[11px] uppercase tracking-[1px] text-t3">honest self-host cost</span>
        <strong class="font-display text-[1.4rem] tabular-nums text-t1">−${{ totalCost.toFixed(2) }}/mo</strong>
      </div>
      <div class="flex flex-col">
        <span class="font-mono text-[11px] uppercase tracking-[1px] text-t3">net saving</span>
        <strong class="font-display text-[1.4rem] tabular-nums" :class="totalSaving > 0 ? 'text-yes' : 'text-no'">${{ totalSaving.toFixed(2) }}/mo</strong>
      </div>
      <button class="ml-auto cursor-pointer rounded-[6px] border border-yes bg-transparent px-[1.1em] py-[0.6em] font-mono text-[12px] text-yes disabled:cursor-default disabled:opacity-40" :disabled="!picked.length" @click="share">
        {{ copied ? 'copied ✓' : '⧉ copy flex' }}
      </button>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-[0.6rem]">
      <button
        v-for="a in apps" :key="a.id"
        class="flex cursor-pointer justify-between gap-2 rounded-[6px] border bg-transparent px-[0.9rem] py-[0.6rem] text-left text-[13.5px] transition-colors"
        :class="selected.has(a.id) ? 'border-yes bg-yes/5 text-t1' : 'border-line text-t1 hover:border-faint'"
        @click="toggle(a.id)"
      >
        <span>{{ selected.has(a.id) ? '✋ ' : '' }}{{ a.name }}</span>
        <span class="font-mono tabular-nums text-t3">${{ a.price_usd_mo }}/mo</span>
      </button>
    </div>
    </div>
  </section>
</template>

