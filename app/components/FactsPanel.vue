<script setup lang="ts">
// "Self-Hosting Facts" — the nutrition label (design: Facts Panel frame in
// untitled.pen). Rows are OUR model (vps share / storage / hours), not the
// design's; the % column is share of the subscription price. The slider
// re-derives everything with the same functions the build uses.
import {
  selfHostCostUsdMo, netMonthlySavingUsd, setupCostUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE,
} from '#shared/derive.mjs'

const props = defineProps<{ app: any }>()
const rate = ref(props.app.derived?.hourly_rate_usd ?? DEFAULT_HOURLY_RATE)
const e = computed(() => props.app.economics)
const maint = computed(() => (e.value.maint_min_mo / 60) * rate.value)
const allIn = computed(() => selfHostCostUsdMo(e.value, rate.value))
const be = computed(() => breakEvenMonths(props.app, rate.value))
const markup = computed(() => markupIndex(props.app, rate.value))
const setup = computed(() => setupCostUsd(props.app, rate.value))
const pct = (n: number) => Math.round((n / props.app.price_usd_mo) * 100) + '%'
const verdictColor = computed(() =>
  props.app.verdict === 'YES' ? 'var(--yes)' : props.app.verdict === 'KINDA' ? 'var(--kinda)' : 'var(--no)')
</script>

<template>
  <div class="facts">
    <div class="f-title">Self-Hosting Facts</div>
    <div class="r1" />
    <div class="serving">
      <div>1 app per panel · {{ app.name }}</div>
      <div>Assumes 1 seat on 1 always-on box you already run</div>
    </div>
    <div class="r8" />
    <div class="col-head">
      <span>Amount per month</span>
      <span>% of sub *</span>
    </div>
    <div class="r1" />
    <div class="sub-row">
      <span class="sub-label">Subscription</span>
      <span class="sub-value num">${{ app.price_usd_mo.toFixed(2) }}</span>
    </div>
    <div class="r4" />
    <div class="cost-row">
      <span class="l">VPS share</span>
      <span class="v num">{{ e.vps_share_usd_mo.toFixed(2) }}</span>
      <span class="p num">{{ pct(e.vps_share_usd_mo) }}</span>
    </div>
    <div class="r1 soft" />
    <div class="cost-row">
      <span class="l">Storage + backup</span>
      <span class="v num">{{ (e.storage_usd_mo ?? 0).toFixed(2) }}</span>
      <span class="p num">{{ pct(e.storage_usd_mo ?? 0) }}</span>
    </div>
    <div class="r1 soft" />
    <div class="cost-row">
      <span class="l">Your hours · {{ e.maint_min_mo }} min @ ${{ rate }}</span>
      <span class="v num">{{ maint.toFixed(2) }}</span>
      <span class="p num">{{ pct(maint) }}</span>
    </div>
    <div class="r1" />
    <div class="cost-row allin">
      <span class="l">Self-hosted all-in</span>
      <span class="v num">{{ allIn.toFixed(2) }}</span>
      <span class="p num">{{ pct(allIn) }}</span>
    </div>
    <div class="r4" />
    <div class="kv-row">
      <span>Effective markup</span>
      <span class="num">{{ markup != null ? markup.toFixed(1) + '×' : '—' }}</span>
    </div>
    <div class="r1 soft" />
    <div class="kv-row">
      <span>Setup · {{ app.verified?.setup_min ?? '—' }} min measured</span>
      <span class="num">${{ setup?.toFixed(2) ?? '—' }} once</span>
    </div>
    <div class="r1 soft" />
    <div class="kv-row">
      <span>Break-even</span>
      <span class="num" :style="be == null ? 'color: var(--no)' : ''">{{ be == null ? 'never' : be.toFixed(1) + ' months' }}</span>
    </div>
    <div class="r8" />
    <div class="verdict-row">
      <div class="v-left">
        <div class="v-label">VERDICT</div>
        <div class="v-value" :style="{ color: verdictColor }">{{ app.verdict === 'NOT_REALLY' ? 'NOT REALLY' : app.verdict ?? 'UNRATED' }}</div>
      </div>
      <div class="v-right">
        <div class="v-label">OUTLOOK</div>
        <DeskOutlookMark :outlook="app.review?.outlook ?? null" />
      </div>
    </div>
    <div class="r1" />
    <label class="slider">
      <span class="slider-label">What's your hour worth? <strong class="num">${{ rate }}/h</strong></span>
      <input v-model.number="rate" type="range" min="0" max="150" step="5" />
    </label>
    <p class="footnote">* Percent of the subscription price. Your time is priced at the slider's rate — $0/h ("my homelab time is free and I love it") is a legitimate position. Every number is derived from <a :href="`https://github.com/zernonia/shouldiselfhost/blob/main/data/apps/${app.id}.json`">the record</a>, never hand-written. Price <a :href="app.price_source">source</a>, checked {{ app.price_checked }}.</p>
  </div>
</template>

<style scoped>
.facts {
  width: 100%; max-width: 520px;
  padding: 20px 22px 18px;
  background: var(--d-surface);
  border: 1px solid var(--d-t2);
  display: flex; flex-direction: column;
  font-family: var(--sans);
}
.f-title { font-family: var(--display); font-size: 31px; font-weight: 700; letter-spacing: -1.3px; line-height: 1.1; color: var(--d-t1); }
.r1 { height: 1px; background: var(--d-t3); }
.r1.soft { background: var(--d-border); }
.r4 { height: 4px; background: var(--d-t1); }
.r8 { height: 8px; background: var(--d-t1); }
.serving { padding: 7px 0 8px; font-size: 13px; color: var(--d-t2); display: flex; flex-direction: column; gap: 3px; }
.col-head { display: flex; justify-content: space-between; align-items: end; padding: 6px 0 5px; font-size: 12px; font-weight: 700; color: var(--d-t1); }
.sub-row { display: flex; justify-content: space-between; align-items: end; padding: 8px 0 7px; }
.sub-label { font-family: var(--display); font-size: 23px; font-weight: 700; letter-spacing: -0.8px; color: var(--d-t1); }
.sub-value { font-family: var(--display); font-size: 28px; font-weight: 700; letter-spacing: -1px; color: var(--d-t1); }
.cost-row { display: flex; gap: 12px; align-items: center; padding: 9px 0; font-size: 13px; }
.cost-row .l { flex: 1; color: var(--d-t2); }
.cost-row .v { width: 56px; color: var(--d-t1); }
.cost-row .p { width: 44px; font-weight: 700; color: var(--d-t2); }
.cost-row.allin { padding: 10px 0; }
.cost-row.allin .l, .cost-row.allin .v, .cost-row.allin .p { color: var(--d-t1); font-weight: 700; font-size: 14px; }
.kv-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 13.5px; font-weight: 600; color: var(--d-t1); }
.kv-row .num { font-weight: 700; font-size: 14px; }
.verdict-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 10px 0 11px; }
.v-left, .v-right { display: flex; flex-direction: column; gap: 3px; }
.v-right { align-items: flex-end; }
.v-label { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.4px; color: var(--d-t3); }
.v-value { font-family: var(--display); font-size: 27px; font-weight: 700; letter-spacing: -1px; }
.slider { display: flex; flex-direction: column; gap: 6px; padding: 12px 0 4px; font-size: 12.5px; color: var(--d-t2); }
.slider input { width: 100%; accent-color: var(--yes); }
.footnote { padding-top: 8px; font-size: 11.5px; line-height: 1.55; color: var(--d-t3); margin: 0; }
.footnote a { color: var(--d-t2); text-decoration: underline; }
</style>
