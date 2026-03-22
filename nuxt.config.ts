export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  app: {
    baseURL: './',
    head: {
      title: 'Gemini Chat — AI Studio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap'
        }
      ]
    }
  },

  vite: {
    // Tell Vite never to try bundling @tauri-apps/* —
    // they are injected at runtime by the Tauri WebView2 host
    build: {
      rollupOptions: {
        external: [
          /^@tauri-apps\/.*/
        ]
      }
    },
    optimizeDeps: {
      exclude: ['@tauri-apps/api', '@tauri-apps/api/core', '@tauri-apps/api/window']
    }
  },

  compatibilityDate: '2024-11-01'
})
