import { useLoadStore } from '@/composables/setupFrames/useLoadStore'
import { useImageManager } from '@/composables/setupImages/useImageManager'

export async function initializeApp() {
  console.log('🚀 Initializing application data...')

  try {
    const { loadLayers, loadAdUnits } = useLoadStore()
    const { preloadDefaultImages } = useImageManager()

    // Load layers into store
    await loadLayers()

    // Load adUnits into store
    await loadAdUnits()

    // Preload default images
    await preloadDefaultImages()

    console.log('✅ Application initialization complete')
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    throw error
  }
}
