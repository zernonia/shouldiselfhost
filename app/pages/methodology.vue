<script setup lang="ts">
const { data } = await useFetch('/api/data/apps')
const site = computed(() => data.value?.site)
useHead({ title: 'Methodology — how verdicts work and who can never touch them' })
</script>

<template>
  <article class="prose">
    <h1>Methodology</h1>
    <p>
      Every list site tells you what exists. <a href="https://caniselfhostit.com">caniselfhostit</a>
      tells you how to run it. We answer the question that costs you money and weekends:
      <strong>should you?</strong> For that answer to be worth anything, it has to be earned the
      hard way — so here is exactly how it's earned, and who is not allowed to influence it.
    </p>

    <h2>The rubric</h2>
    <p>A verdict is <strong>YES</strong> ("worth it"), <strong>KINDA</strong> ("worth it if…") or
      <strong>NOT REALLY</strong> ("keep paying"), computed from four inputs:</p>
    <ol>
      <li><strong>Capability</strong> — the primary alternative covers ≥80% of the jobs people actually pay the SaaS for.</li>
      <li><strong>Economics</strong> — break-even inside {{ site?.break_even_window_mo ?? 18 }} months at
        ${{ site?.hourly_rate_usd ?? 20 }}/h for your time (every page has a slider — the derivation is the same
        <a href="https://github.com/zernonia/shouldiselfhost/blob/main/shared/derive.mjs">code</a> at every rate).
        We count VPS share, storage, <em>and maintenance minutes</em>. Hiding the time cost is how other people lie to you.</li>
      <li><strong>Effort ceiling</strong> — YES requires the core workflow running in ≤2 measured hours; KINDA within one weekend. Past that, no software is good enough.</li>
      <li><strong>Project health</strong> — a primary alternative with no commit in 12 months caps the verdict and gets a ⚠️ flag, automatically, nightly.</li>
    </ol>
    <p>
      The rubric means a verdict can be <em>argued against criteria</em> — open a
      <a href="https://github.com/zernonia/shouldiselfhost/issues/new?template=verdict-dispute.yml">dispute</a>
      with evidence. It also means we can say NOT REALLY about software that self-hosts
      beautifully. Capable but not worth your weekends is a verdict our format can express —
      and honest NOs are why you can trust the YESes.
    </p>

    <h2>Test protocol v1</h2>
    <ul>
      <li>Reference environment: {{ site?.reference_env }}.</li>
      <li>AI assistant <strong>allowed and stated</strong> — protocol v1 assumes Claude Code (or equivalent) as your sysadmin, because that's how people actually self-host in 2026.</li>
      <li>Setup is <strong>timed</strong>, wall clock, empty directory → core workflow working. "47 minutes" on a page is a measurement, not vibes.</li>
      <li>Every verdict ships its compose file and timed log. <strong>CI boots every compose file and checks its health endpoint — a broken install claim cannot merge.</strong></li>
      <li>Every verdict names who verified it and when. Verdicts older than 12 months dim and get a re-test issue.</li>
    </ul>

    <h2>Who can never touch a verdict</h2>
    <ul>
      <li><strong>Votes.</strong> Display-only, forever. Brigading is inevitable; that's why the scoreboard and the verdict are separate systems.</li>
      <li><strong>Sponsors.</strong> Sponsorship buys a labeled slot, never a word of a verdict page's rubric sections.</li>
      <li><strong>Affiliate links.</strong> VPS links appear only <em>below</em> the math they help you act on, are labeled, and never affect rankings. (caniselfhostit is proudly "no ads, no affiliate links" — we're transparent instead of abstinent, and this page is the contract.)</li>
      <li><strong>Automation.</strong> Bots refresh metrics and propose PRs; humans merge every verdict change. The <a href="/rss.xml">changelog is public</a>.</li>
    </ul>

    <h2>Data & licenses</h2>
    <p>
      Capability seed (app → replacement pairings, pricing snapshots) from
      <a href="https://github.com/caniselfhostit/caniselfhostit">caniselfhostit</a> (MIT, © Jashanpreet Singh),
      marked per-record with <code>provenance</code>. Our decision layer — verdicts, economics,
      timings, votes — is <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>:
      take it, credit it, keep it open. The full dataset is free at
      <a href="/api/apps.json">/api/apps.json</a> and summarized in <a href="/llms.txt">/llms.txt</a>.
    </p>
  </article>
</template>

<style scoped>
.prose { max-width: 760px; }
.prose h2 { font-size: 1.15rem; margin-top: 2rem; }
.prose li { margin: 0.4rem 0; }
</style>
