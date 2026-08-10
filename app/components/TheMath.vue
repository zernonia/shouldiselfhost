<script setup lang="ts">
// The honest TCO block. The slider re-derives everything client-side with the SAME functions
// the build uses (shared/derive.mjs) — one source of truth, per the golden rule.
import {
  selfHostCostUsdMo, netMonthlySavingUsd, setupCostUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE,
} from '#shared/derive.mjs'

const props = defineProps<{ app: any }>()
const rate = ref(props.app.derived?.hourly_rate_usd ?? DEFAULT_HOURLY_RATE)

const cost = computed(() => selfHostCostUsdMo(props.app.economics, rate.value))
const saving = computed(() => netMonthlySavingUsd(props.app, rate.value))
const setup = computed(() => setupCostUsd(props.app, rate.value))
const be = computed(() => breakEvenMonths(props.app, rate.value))
const markup = computed(() => markupIndex(props.app, rate.value))
const fmt = (n: number | null, digits = 2) => (n == null ? '—' : `$${n.toFixed(digits)}`)
</script>

<template>
  <div class="card math">
    <h2>The math <span class="dim">(nothing hidden, including your time)</span></h2>
    <table class="board">
      <tbody>
        <tr>
          <td>{{ app.name }} <span class="dim">({{ app.price_plan }}<template v-if="app.price_unit === 'per-seat'">, per seat</template>)</span></td>
          <td class="r num">{{ fmt(app.price_usd_mo) }}/mo</td>
        </tr>
        <tr v-if="app.economics">
          <td>VPS share <span class="dim">+ storage</span></td>
          <td class="r num">−{{ fmt(app.economics.vps_share_usd_mo + (app.economics.storage_usd_mo ?? 0)) }}/mo</td>
        </tr>
        <tr v-if="app.economics">
          <td>Your maintenance: {{ app.economics.maint_min_mo }} min/mo <span class="dim">at ${{ rate }}/h</span></td>
          <td class="r num">−{{ fmt((app.economics.maint_min_mo / 60) * rate) }}/mo</td>
        </tr>
        <tr class="total">
          <td><strong>Net saving</strong></td>
          <td class="r num" :class="saving != null && saving > 0 ? 'pos' : 'neg'"><strong>{{ fmt(saving) }}/mo</strong></td>
        </tr>
        <tr v-if="app.verified">
          <td>Setup: {{ app.verified.setup_min }} min measured <span class="dim">(one-time)</span></td>
          <td class="r num">{{ fmt(setup) }}</td>
        </tr>
        <tr class="total">
          <td><strong>Break-even</strong></td>
          <td class="r num">
            <strong v-if="be != null">{{ be.toFixed(1) }} months</strong>
            <strong v-else class="neg">never</strong>
          </td>
        </tr>
        <tr v-if="markup != null">
          <td>Markup Index <span class="dim">(price ÷ real self-host cost)</span></td>
          <td class="r num">{{ markup.toFixed(1) }}×</td>
        </tr>
      </tbody>
    </table>
    <label class="slider">
      <span>What's your hour worth? <strong class="num">${{ rate }}/h</strong></span>
      <input v-model.number="rate" type="range" min="0" max="150" step="5" />
      <span class="dim hint">$0/h = "my homelab time is free and I love it" — a legitimate position</span>
    </label>
    <p class="dim src">
      Price: <a :href="app.price_source">source</a>, checked {{ app.price_checked }}.
      Inputs are stored in <a :href="`https://github.com/zernonia/shouldiselfhost/blob/main/data/apps/${app.id}.json`">git</a>;
      every number above is derived, never hand-written.
    </p>
  </div>
</template>

<style scoped>
.math h2 { margin-top: 0; font-size: 1.1rem; }
.total td { border-top: 1px solid var(--border); }
.slider { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 1rem; font-size: 0.9rem; }
.slider input { width: 100%; accent-color: var(--accent); }
.hint { font-size: 0.78rem; }
.src { font-size: 0.78rem; margin-bottom: 0; }
</style>
