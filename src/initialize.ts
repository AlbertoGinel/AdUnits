import { useLoadStore } from '@/composables/setupFrames/useLoadStore'

/**
 * Initialize application data on startup
 * This runs immediately when the app starts, before any components mount
 */
export async function initializeApp() {
  console.log('🚀 Initializing application data...')

  try {
    const { loadLayers, loadAdUnits } = useLoadStore()

    // Load layers into store
    await loadLayers()

    // Load adUnits into store
    await loadAdUnits()

    console.log('✅ Application initialization complete')
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    throw error
  }
}
