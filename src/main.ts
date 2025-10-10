import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useBannerStore } from './stores/banners'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize banner store after mounting the app
app.mount('#app')

// Initialize the banner store to load templates and create default banner group
const bannerStore = useBannerStore()
bannerStore.initializeStore()

// Debug: Log templates for DevTools visibility
console.log('📋 Available Banner Templates:', bannerStore.availableTemplates)
console.log('🏗️ Current Banner Group:', bannerStore.currentBannerGroup)
