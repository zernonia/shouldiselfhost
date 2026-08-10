import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: { deployConfig: false },
    // Git is the CMS: data/ + compose/ ship as server assets so the same code path
    // serves prerender (build) and the Worker (runtime).
    serverAssets: [
      { baseName: 'appdata', dir: fileURLToPath(new URL('./data', import.meta.url)) },
      { baseName: 'compose', dir: fileURLToPath(new URL('./compose', import.meta.url)) },
      { baseName: 'logs', dir: fileURLToPath(new URL('./logs', import.meta.url)) },
    ],
    prerender: {
      crawlLinks: true,
      routes: ['/', '/llms.txt', '/rss.xml', '/api/apps.json'],
    },
  },

  routeRules: {
    // Everything static + CDN-cached; only the vote plane stays on the Worker.
    '/**': { prerender: true },
    '/api/**': { prerender: false },
    '/api/apps.json': { prerender: true },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: (t) => (t ? `${t} · shouldiselfhost` : 'Should I self-host it?'),
      link: [
        {
          rel: 'icon',
          href:
            'data:image/svg+xml,' +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚖️</text></svg>',
            ),
        },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Verdict changes', href: '/rss.xml' },
      ],
      meta: [
        { name: 'description', content: 'They tell you if you can. We tell you if you should. Verdicts, honest math and break-even dates for self-hosting 100 popular SaaS apps.' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
