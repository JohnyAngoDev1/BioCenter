// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image"],
  css: ["~/assets/main.css"],
  telemetry: false,

  ui: {
    colorMode: false,
  },

  runtimeConfig: {
    payphoneApiUrl: "https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod",
    payphoneToken:
      "lOnz_cBeh9HWBAiaDZdvwp8GpQYqXK5msXQBQv33c9tmRfUQ1gPMfzy-LfEzEUdCtQtMCjUKR31ouyJXked8MIfSXEXwG512h0O0kwug4wUtJe7z0FiTPwcy8pVreNdMjBl6plYwTC90mfs0zCClxiQHaUTzjecDk-P3SyPEmtxToaLZZSGmgYjY8cF9hLktEIQX5T2QSWDwXC16D3K8QcvYQPOL3WTGZTFV7NS6u_iRvFDTOZcCGUd5MgTKxdBweFxFXcVWzlJt0_g2PtW0IuLAi-z7DqfmSHxHW4SYKr4B_BglcJwvabXbRtljb0KpiU0WwQ",
    apiUrl: "https://landingpay.magdata.com.ec/",

    public: {
      payphoneStoreId: "375b02e9-e1e9-4a8e-850e-1cab5b9000e2",
      apiUrl: "https://landingpay.magdata.com.ec/",
    }
  },
});
