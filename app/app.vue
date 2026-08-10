<template>
  <div class="site">
    <header class="site-header">
      <div class="container header-row">
        <NuxtLink to="/" class="brand">should<span class="dim">i</span>selfhost<span class="accent">?</span></NuxtLink>
        <nav class="nav">
          <NuxtLink to="/vs">vs</NuxtLink>
          <NuxtLink to="/stack">my stack</NuxtLink>
          <NuxtLink to="/methodology">methodology</NuxtLink>
          <a href="/api/apps.json">data</a>
          <a href="/rss.xml">rss</a>
          <a href="https://github.com/zernonia/shouldiselfhost">github</a>
        </nav>
      </div>
      <div class="container tagline">They tell you if you <em>can</em>. We tell you if you <em>should</em>.</div>
    </header>

    <main class="container main">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>
          Not a directory — a scoreboard. Verdicts follow a
          <NuxtLink to="/methodology">published rubric</NuxtLink>; votes and sponsors never touch them.
        </p>
        <p class="dim">
          The third leg of the stool: <a href="https://canivibecodeit.com">canivibecodeit</a> asks "can AI rebuild it?" ·
          <a href="https://caniselfhostit.com">caniselfhostit</a> asks "can you run it?" · we ask "is it worth it?"
        </p>
        <p class="dim">
          Capability data seeded from <a href="https://github.com/caniselfhostit/caniselfhostit">caniselfhostit.com</a>
          (MIT, © Jashanpreet Singh) — thank you. Our decision-layer data is
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, site code
          <a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site { min-height: 100vh; display: flex; flex-direction: column; }
.site-header { border-bottom: 1px solid var(--border); padding: 1rem 0 0.9rem; }
.header-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.brand { font-family: var(--mono); font-size: 1.15rem; font-weight: 700; color: var(--text); }
.brand:hover { text-decoration: none; }
.accent { color: var(--accent); }
.nav { display: flex; gap: 1.1rem; font-size: 0.9rem; }
.tagline { margin-top: 0.35rem; font-size: 0.85rem; color: var(--text-dim); }
.main { flex: 1; padding: 2rem 1.25rem 4rem; }
.site-footer { border-top: 1px solid var(--border); padding: 1.5rem 0 2.5rem; font-size: 0.85rem; }
</style>
