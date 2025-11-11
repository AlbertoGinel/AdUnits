import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { initializeApp } from './initialize'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Mount app first, then initialize data
app.mount('#app')

// Initialize application data after mount
initializeApp().catch((error) => {
  console.error('Failed to initialize app:', error)
})
