import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { useCanvasStore } from './stores/konva'
import { initializeTools, activateDefaultTool } from './services/toolInitializer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Initialize app after mounting
app.mount('#app')

// Load SVG background (delayed to ensure stage is ready)
import { SVGService } from './services/svg/SVGService'
setTimeout(() => {
  SVGService.loadSVGBackground()
}, 200) // Small delay to ensure stage is mounted

// Initialize modular tools system
initializeTools()

// Auto-activate first tool for demo
setTimeout(() => {
  activateDefaultTool()
}, 100)
