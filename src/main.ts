import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { initializeTools, activateDefaultTool } from './services/toolInitializer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Initialize app after mounting
app.mount('#app')

// Initialize the nodes store to see nodes in devtools
import { useNodesStore } from './stores/nodes'
const nodesStore = useNodesStore()
console.log('🎨 Nodes Store initialized:', nodesStore.nodes.length, 'nodes')
console.log('📋 Initial nodes:', nodesStore.nodes)

// Add test node via PopulateService
import { PopulateService } from './services/populate'
setTimeout(() => {
  PopulateService.addBlueSquare()
}, 200) // Small delay to ensure everything is ready

// Initialize modular tools system
initializeTools()

// Auto-activate first tool for demo
setTimeout(() => {
  activateDefaultTool()
}, 100)
