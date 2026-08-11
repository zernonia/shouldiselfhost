// Shared Tailwind utility strings for the desk's repeated editorial patterns.
// Plain string constants: Tailwind's scanner reads these literals, templates
// bind them with :class, and one edit restyles the pattern everywhere.
export const dk = {
  // section scaffold — full-bleed hairline, content capped at 1240px
  row: 'grid grid-cols-[minmax(20px,1fr)_110px_minmax(0,1088px)_minmax(20px,1fr)] gap-x-[42px] border-b border-line py-[66px] max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-5 max-[900px]:px-5 max-[900px]:py-11',
  rowTinted: 'bg-[#0B0C0FB3]',
  gutter: 'col-start-2 flex flex-col gap-[7px] self-stretch max-[900px]:flex-row max-[900px]:items-baseline max-[900px]:gap-3',
  body: 'col-start-3 flex min-w-0 flex-col gap-[34px]',
  secNo: 'font-mono text-[15px] font-bold tracking-[0.4px] text-yes',
  secName: 'font-mono text-[10px] tracking-[1.3px] text-t3',
  secSub: 'font-mono text-[10px] tracking-[1.3px] text-dim',

  // type patterns
  microLabel: 'font-mono text-[10px] font-semibold tracking-[1.5px] text-t3',
  rollTitle: 'font-display text-[28px] font-medium tracking-[-0.9px] text-t1',
  rollSub: 'm-0 text-sm leading-[1.65] text-t2',
  liveNote: 'm-0 font-mono text-[11.5px] text-t3',
  mono: 'font-mono tabular-nums',
  ruleH: 'h-px bg-line',

  // widgets
  chip: 'inline-flex cursor-pointer items-center gap-[7px] rounded-[6px] border border-line bg-transparent px-[13px] py-2 font-mono text-[11.5px] text-t2 transition-colors hover:border-faint hover:text-t1',
  chipActive: 'border-yes! bg-yes font-semibold text-bg! hover:text-bg!',
  metaLabel: 'mb-[5px] font-mono text-[9.5px] tracking-[1.2px] text-dim',
  metaValue: 'font-mono tabular-nums text-[11.5px] text-t2',
  condition: 'flex gap-[14px] [&>p]:m-0 [&>p]:text-[13.5px] [&>p]:leading-[1.65] [&>p]:text-t2',
  conditionIdx: 'font-mono tabular-nums text-[12px] text-yes',

  // roll table cells
  thead: 'flex min-w-[900px] items-center gap-[22px] border-b border-line pb-[13px] font-mono text-[9.5px] tracking-[1.3px] text-faint',
  trow: 'flex min-w-[900px] items-center gap-[22px] border-b border-surface-2 py-[15px] text-t1',
  cEntity: 'w-[322px] shrink-0',
  cRating: 'w-[120px] shrink-0',
  cOutlook: 'w-[118px] shrink-0',
  cBar: 'w-[150px] shrink-0',
  cRatio: 'w-[58px] shrink-0 font-mono tabular-nums text-[13.5px] font-bold text-t1',
  cBreak: 'w-[84px] shrink-0 font-mono tabular-nums text-[12.5px] text-t2',
  cRev: 'w-[78px] shrink-0 font-mono tabular-nums text-[12px] text-t3',
  cSwap: 'w-[70px] shrink-0 font-mono tabular-nums text-[13px] font-bold text-t1',
}

export const verdictText = (v?: string | null) =>
  v === 'YES' ? 'text-yes' : v === 'KINDA' ? 'text-kinda' : v === 'NOT_REALLY' ? 'text-no' : 'text-faint'
export const verdictBg = (v?: string | null) =>
  v === 'YES' ? 'bg-yes' : v === 'KINDA' ? 'bg-kinda' : v === 'NOT_REALLY' ? 'bg-no' : 'bg-faint'
export const verdictLabel = (v?: string | null) =>
  v === 'NOT_REALLY' ? 'NOT REALLY' : v ?? 'UNRATED'
