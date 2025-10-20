import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { useAdUnitsStore } from './stores/adUnits'
import { initializeTools, activateDefaultTool } from './services/toolInitializer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Initialize AdUnits store after mounting the app
app.mount('#app')

// Initialize the AdUnits store to load Creative Frames
const adUnitsStore = useAdUnitsStore()
adUnitsStore.initializeStore()

// Initialize modular tools system
initializeTools()

// Auto-activate first tool for demo
setTimeout(() => {
  activateDefaultTool()
}, 100)
