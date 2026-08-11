<script setup lang="ts">
// Stack flex page: pick what you self-host, get the number, share the URL.
// Selection lives in the query string (?apps=a,b,c) so a share link reproduces the stack —
// no accounts, no server state. r/selfhosted's favorite genre, given a scoreboard.
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
  <section class="row hero-row">
    <div class="gutter">
      <div class="sec-no">MY</div>
      <div class="sec-name">STACK</div>
    </div>
    <div class="body">
    <div class="roll-title big">My homelab replaces…</div>
    <p class="roll-sub">
      Pick what you actually self-host. The math is the same honest math as everywhere else on
      this site — subscription prices minus server share, storage, and your time at the
      reference rate. Share link carries your whole stack.
    </p>

    <div class="summary">
      <div class="stat">
        <span class="dim">subscriptions escaped</span>
        <strong class="num pos">${{ totalPrice.toFixed(2) }}/mo</strong>
      </div>
      <div class="stat">
        <span class="dim">honest self-host cost</span>
        <strong class="num">−${{ totalCost.toFixed(2) }}/mo</strong>
      </div>
      <div class="stat">
        <span class="dim">net saving</span>
        <strong class="num" :class="totalSaving > 0 ? 'pos' : 'neg'">${{ totalSaving.toFixed(2) }}/mo</strong>
      </div>
      <button class="share" :disabled="!picked.length" @click="share">
        {{ copied ? 'copied ✓' : '⧉ copy flex' }}
      </button>
    </div>

    <div class="grid">
      <button
        v-for="a in apps" :key="a.id"
        class="card app-pick" :class="{ on: selected.has(a.id) }"
        @click="toggle(a.id)"
      >
        <span class="name">{{ a.name }}</span>
        <span class="num dim">${{ a.price_usd_mo }}/mo</span>
      </button>
    </div>
    </div>
  </section>
</template>

<style scoped>
.hero-row { padding-top: 54px; }
.roll-title.big { font-size: clamp(26px, 3vw, 40px); letter-spacing: -1.5px; }
.summary { display: flex; gap: 2rem; align-items: center; flex-wrap: wrap; padding: 16px 18px; background: var(--d-surface); border: 1px solid var(--d-border); position: sticky; top: 0.5rem; z-index: 2; }
.stat { display: flex; flex-direction: column; }
.stat strong { font-size: 1.4rem; font-family: var(--display); }
.stat span { font-size: 11px; font-family: var(--mono); letter-spacing: 1px; text-transform: uppercase; color: var(--d-t3); }
.share {
  margin-left: auto; font-family: var(--mono); font-size: 12px; cursor: pointer; color: var(--yes);
  background: none; border: 1px solid var(--yes); border-radius: 6px; padding: 0.6em 1.1em;
}
.share:disabled { opacity: 0.4; cursor: default; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.6rem; }
.app-pick {
  font: inherit; text-align: left; cursor: pointer; color: var(--d-t1);
  background: none; border: 1px solid var(--d-border); border-radius: 6px;
  display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.9rem;
}
.app-pick.on { border-color: var(--yes); background: #34D3990D; }
.app-pick.on .name::before { content: '✋ '; }
</style>
