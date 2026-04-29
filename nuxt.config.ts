// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image'],
  css: ['~/assets/main.css'],
  telemetry: false,

  ui: {
    colorMode: false,
  },

  runtimeConfig: {
    payphoneApiUrl: 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod',
  }
})