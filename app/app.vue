<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { menuOpen.value = false })
watch(menuOpen, (v) => {
  if (import.meta.client) document.documentElement.style.overflow = v ? 'hidden' : ''
})
const links = [
  { to: '/vs', label: 'versus' },
  { to: '/stack', label: 'my stack' },
  { to: '/methodology', label: 'methodology' },
  { href: '/api/apps.json', label: 'data' },
  { href: 'https://github.com/zernonia/shouldiselfhost', label: 'github' },
]
</script>

<template>
  <div class="site">
    <div class="mesh" aria-hidden="true" />
    <div class="grain" aria-hidden="true" />

    <!-- Floating glass pill nav -->
    <header class="nav-wrap">
      <nav class="island">
        <NuxtLink to="/" class="brand">should<span class="brand-dim">i</span>selfhost<span class="brand-q">?</span></NuxtLink>
        <div class="nav-links">
          <template v-for="l in links" :key="l.label">
            <NuxtLink v-if="l.to" :to="l.to">{{ l.label }}</NuxtLink>
            <a v-else :href="l.href">{{ l.label }}</a>
          </template>
        </div>
        <button class="burger" :class="{ open: menuOpen }" aria-label="Menu" @click="menuOpen = !menuOpen">
          <span /><span />
        </button>
      </nav>
    </header>

    <!-- Full-screen glass menu, staggered mask reveal -->
    <Transition name="veil">
      <div v-if="menuOpen" class="veil" @click.self="menuOpen = false">
        <div class="veil-links">
          <template v-for="(l, i) in links" :key="l.label">
            <NuxtLink v-if="l.to" :to="l.to" class="veil-link" :style="{ transitionDelay: `${100 + i * 60}ms` }">{{ l.label }}</NuxtLink>
            <a v-else :href="l.href" class="veil-link" :style="{ transitionDelay: `${100 + i * 60}ms` }">{{ l.label }}</a>
          </template>
        </div>
      </div>
    </Transition>

    <main class="container main">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="container foot-grid">
        <div>
          <div class="foot-brand">shouldiselfhost<span class="brand-q">?</span></div>
          <p class="dim">Not a directory — a scoreboard. Verdicts follow a <NuxtLink to="/methodology">published rubric</NuxtLink>; votes and sponsors never touch them.</p>
        </div>
        <div class="dim foot-meta">
          <p>The third leg of the stool: <a href="https://canivibecodeit.com">canivibecodeit</a> asks “can AI rebuild it?” · <a href="https://caniselfhostit.com">caniselfhostit</a> asks “can you run it?” · we ask <em>“is it worth it?”</em></p>
          <p>Capability data seeded from <a href="https://github.com/caniselfhostit/caniselfhostit">caniselfhostit.com</a> (MIT, © Jashanpreet Singh) — thank you. Decision-layer data <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · site code <a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0</a>.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site { min-height: 100dvh; display: flex; flex-direction: column; }

.nav-wrap {
  position: fixed; top: 0; left: 0; right: 0; z-index: 40;
  display: flex; justify-content: center;
  padding: 1.4rem 1rem 0;
  pointer-events: none;
}
.island {
  pointer-events: auto;
  display: flex; align-items: center; gap: 1.6rem;
  background: rgba(10, 10, 12, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--hairline);
  border-radius: 999px;
  padding: 0.55rem 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.06);
}
.brand { font-family: var(--display); font-weight: 700; font-size: 1.02rem; letter-spacing: -0.01em; color: var(--text); }
.brand:hover { color: var(--text); }
.brand-dim { color: var(--text-faint); }
.brand-q { color: var(--accent); }
.nav-links { display: flex; gap: 1.25rem; font-size: 0.86rem; }
.nav-links a { color: var(--text-dim); }
.nav-links a:hover, .nav-links a.router-link-active { color: var(--text); }

.burger { display: none; position: relative; width: 34px; height: 34px; background: none; border: none; cursor: pointer; }
.burger span {
  position: absolute; left: 7px; right: 7px; height: 1.5px; background: var(--text);
  transition: transform 0.55s var(--ease), top 0.55s var(--ease);
}
.burger span:nth-child(1) { top: 13px; }
.burger span:nth-child(2) { top: 20px; }
.burger.open span:nth-child(1) { top: 16px; transform: rotate(45deg); }
.burger.open span:nth-child(2) { top: 16px; transform: rotate(-45deg); }

.veil {
  position: fixed; inset: 0; z-index: 30;
  background: rgba(5, 5, 5, 0.82);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  display: flex; align-items: center; justify-content: center;
}
.veil-links { display: flex; flex-direction: column; gap: 1.6rem; text-align: center; }
.veil-link {
  font-family: var(--display); font-size: 2rem; font-weight: 500; color: var(--text);
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
}
.veil-enter-active .veil-link, .veil .veil-link { opacity: 1; transform: translateY(0); }
.veil-enter-from .veil-link { opacity: 0; transform: translateY(28px); }
.veil-enter-active, .veil-leave-active { transition: opacity 0.5s var(--ease); }
.veil-enter-from, .veil-leave-to { opacity: 0; }

.main { flex: 1; padding: 7.5rem 1.25rem 5rem; width: 100%; }

.site-footer { border-top: 1px solid var(--hairline-soft); padding: 3.5rem 0 4rem; font-size: 0.85rem; }
.foot-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 3rem; }
.foot-brand { font-family: var(--display); font-weight: 700; margin-bottom: 0.5rem; }
.foot-meta p { margin: 0 0 0.8rem; }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .burger { display: block; }
  .island { gap: 0.8rem; padding: 0.45rem 0.6rem 0.45rem 1.2rem; }
  .main { padding: 6.5rem 1rem 3.5rem; }
  .foot-grid { grid-template-columns: 1fr; gap: 1.2rem; }
}
</style>
