import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { useAppInitializer } from '@/composables/setupFrames/useAppInitializer'

// Import stores to force early initialization
import { useImageStore } from '@/stores/useImageStore'
import { useCanvasStore } from '@/stores/canvas'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Force store initialization BEFORE mounting
console.log('🍍 Pre-initializing stores...')
const imageStore = useImageStore()
const canvasStore = useCanvasStore()

console.log('✅ Stores initialized:', {
  image: !!imageStore,
  canvas: !!canvasStore,
})

// Mount app first
app.mount('#app')

// Then start initialization (components will show skeleton until ready)
const { initializeApp } = useAppInitializer()
initializeApp()
