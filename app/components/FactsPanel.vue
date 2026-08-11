<script setup lang="ts">
// "Self-Hosting Facts" — the nutrition label (Facts Panel frame in
// untitled.pen), pure Tailwind. Rows are OUR model; % column is share of the
// subscription price; the slider re-derives with the build's own functions.
import {
  selfHostCostUsdMo, setupCostUsd, breakEvenMonths, markupIndex,
  DEFAULT_HOURLY_RATE,
} from '#shared/derive.mjs'
import { verdictText, verdictLabel } from '~/composables/deskClasses'

const props = defineProps<{ app: any }>()
const rate = ref(props.app.derived?.hourly_rate_usd ?? DEFAULT_HOURLY_RATE)
const e = computed(() => props.app.economics)
const maint = computed(() => (e.value.maint_min_mo / 60) * rate.value)
const allIn = computed(() => selfHostCostUsdMo(e.value, rate.value))
const be = computed(() => breakEvenMonths(props.app, rate.value))
const markup = computed(() => markupIndex(props.app, rate.value))
const setup = computed(() => setupCostUsd(props.app, rate.value))
const pct = (n: number) => Math.round((n / props.app.price_usd_mo) * 100) + '%'

const costRow = 'flex items-center gap-3 py-[9px] text-[13px]'
const costL = 'flex-1 text-t2'
const costV = 'w-14 font-mono tabular-nums text-t1'
const costP = 'w-11 font-mono tabular-nums font-bold text-t2'
const kvRow = 'flex items-center justify-between py-[9px] text-[13.5px] font-semibold text-t1'
const r1 = 'h-px bg-t3'
const r1soft = 'h-px bg-line'
</script>

<template>
  <div class="flex w-full max-w-[520px] flex-col border border-t2 bg-surface px-[22px] pb-[18px] pt-5">
    <div class="font-display text-[31px] font-bold leading-[1.1] tracking-[-1.3px] text-t1">Self-Hosting Facts</div>
    <div :class="r1" />
    <div class="flex flex-col gap-[3px] py-[7px] pb-2 text-[13px] text-t2">
      <div>1 app per panel · {{ app.name }}</div>
      <div>Assumes 1 seat on 1 always-on box you already run</div>
    </div>
    <div class="h-2 bg-t1" />
    <div class="flex items-end justify-between py-[6px] pb-[5px] text-[12px] font-bold text-t1">
      <span>Amount per month</span>
      <span>% of sub *</span>
    </div>
    <div :class="r1" />
    <div class="flex items-end justify-between py-2 pb-[7px]">
      <span class="font-display text-[23px] font-bold tracking-[-0.8px] text-t1">Subscription</span>
      <span class="font-display text-[28px] font-bold tracking-[-1px] text-t1">${{ app.price_usd_mo.toFixed(2) }}</span>
    </div>
    <div class="h-1 bg-t1" />
    <div :class="costRow">
      <span :class="costL">VPS share</span>
      <span :class="costV">{{ e.vps_share_usd_mo.toFixed(2) }}</span>
      <span :class="costP">{{ pct(e.vps_share_usd_mo) }}</span>
    </div>
    <div :class="r1soft" />
    <div :class="costRow">
      <span :class="costL">Storage + backup</span>
      <span :class="costV">{{ (e.storage_usd_mo ?? 0).toFixed(2) }}</span>
      <span :class="costP">{{ pct(e.storage_usd_mo ?? 0) }}</span>
    </div>
    <div :class="r1soft" />
    <div :class="costRow">
      <span :class="costL">Your hours · {{ e.maint_min_mo }} min @ ${{ rate }}</span>
      <span :class="costV">{{ maint.toFixed(2) }}</span>
      <span :class="costP">{{ pct(maint) }}</span>
    </div>
    <div :class="r1" />
    <div :class="costRow" class="py-[10px]">
      <span :class="costL" class="text-[14px] font-bold text-t1!">Self-hosted all-in</span>
      <span :class="costV" class="text-[14px] font-bold">{{ allIn.toFixed(2) }}</span>
      <span :class="costP" class="text-[14px] text-t1!">{{ pct(allIn) }}</span>
    </div>
    <div class="h-1 bg-t1" />
    <div :class="kvRow">
      <span>Effective markup</span>
      <span class="font-mono tabular-nums text-[14px] font-bold">{{ markup != null ? markup.toFixed(1) + '×' : '—' }}</span>
    </div>
    <div :class="r1soft" />
    <div :class="kvRow">
      <span>Setup · {{ app.verified?.setup_min ?? '—' }} min measured</span>
      <span class="font-mono tabular-nums text-[14px] font-bold">${{ setup?.toFixed(2) ?? '—' }} once</span>
    </div>
    <div :class="r1soft" />
    <div :class="kvRow">
      <span>Break-even</span>
      <span class="font-mono tabular-nums text-[14px] font-bold" :class="be == null ? 'text-no' : ''">{{ be == null ? 'never' : be.toFixed(1) + ' months' }}</span>
    </div>
    <div class="h-2 bg-t1" />
    <div class="flex items-center justify-between gap-4 py-[10px] pb-[11px]">
      <div class="flex flex-col gap-[3px]">
        <div class="font-mono text-[10px] font-semibold tracking-[1.4px] text-t3">VERDICT</div>
        <div class="font-display text-[27px] font-bold tracking-[-1px]" :class="verdictText(app.verdict)">{{ verdictLabel(app.verdict) }}</div>
      </div>
      <div class="flex flex-col items-end gap-[3px]">
        <div class="font-mono text-[10px] font-semibold tracking-[1.4px] text-t3">OUTLOOK</div>
        <DeskOutlookMark :outlook="app.review?.outlook ?? null" />
      </div>
    </div>
    <div :class="r1" />
    <label class="flex flex-col gap-[6px] py-3 pb-1 text-[12.5px] text-t2">
      <span>What's your hour worth? <strong class="font-mono tabular-nums">${{ rate }}/h</strong></span>
      <input v-model.number="rate" type="range" min="0" max="150" step="5" class="w-full accent-yes" />
    </label>
    <p class="m-0 pt-2 text-[11.5px] leading-[1.55] text-t3">* Percent of the subscription price. Your time is priced at the slider's rate — $0/h ("my homelab time is free and I love it") is a legitimate position. Every number is derived from <a :href="`https://github.com/zernonia/shouldiselfhost/blob/main/data/apps/${app.id}.json`" class="text-t2 underline">the record</a>, never hand-written. Price <a :href="app.price_source" class="text-t2 underline">source</a>, checked {{ app.price_checked }}.</p>
  </div>
</template>
