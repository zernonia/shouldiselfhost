// v-reveal — IntersectionObserver scroll-entry animation (no scroll listeners).
// Usage: v-reveal or v-reveal="2" (stagger step → 90ms increments).
// Registered universally: the server side renders nothing (getSSRProps no-op)
// so prerendered HTML ships un-animated and the client adds .rv on mount.
export default defineNuxtPlugin((nuxtApp) => {
  let io: IntersectionObserver | null = null
  if (import.meta.client && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('rv-in')
            io!.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
  }

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding) {
      if (!io) return
      el.classList.add('rv')
      const step = Number(binding.value) || 0
      if (step) el.style.setProperty('--rv-delay', `${Math.min(step * 90, 540)}ms`)
      io.observe(el)
    },
    getSSRProps() {
      return {}
    },
  })
})
