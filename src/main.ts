import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

// Creative ID - configure this for your specific creative
const CREATIVE_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

// Import CSS Variables and Fonts
import '@/assets/styles/variables.css'
import '@/assets/styles/fonts.css'
import '@/assets/styles/global.css'

import App from './App.vue'
import router from './router'
import { useAppInitializer } from '@/features/setupApp/useAppInitializer'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueKonva)

// Mount app first
app.mount('#app')

const { initializeApp } = useAppInitializer(CREATIVE_ID)
initializeApp()
