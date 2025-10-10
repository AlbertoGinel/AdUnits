import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { useBannerStore } from './stores/banners'
import { initializeTools, activateDefaultTool } from './services/toolInitializer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Initialize banner store after mounting the app
app.mount('#app')

// Initialize the banner store to load templates and create default banner group
const bannerStore = useBannerStore()
bannerStore.initializeStore()

// Initialize modular tools system
initializeTools()

// Auto-activate first tool for demo
setTimeout(() => {
  activateDefaultTool()
}, 100)

// Debug: Log templates for DevTools visibility
console.log('📋 Available Banner Templates:', bannerStore.availableTemplates)
console.log('🏗️ Current Banner Group:', bannerStore.currentBannerGroup)
