// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  
  app: {
    head: {
      title: '个人简历编辑器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '极简商务风格个人简历排版编辑器，支持模板选择、信息编辑、模块拖拽、预览导出' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [
    'element-plus/dist/index.css',
    'element-plus/theme-chalk/display.css',
    '@/assets/styles/global.scss'
  ],

  modules: [
    '@pinia/nuxt'
  ],

  pinia: {
    storesDirs: ['./stores/**']
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    },
    optimizeDeps: {
      include: ['jspdf', 'html2canvas'],
      exclude: []
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
