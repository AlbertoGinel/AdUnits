import { useCreativeAPI } from '../api/useCreativeAPI'
import { useAppStore } from '@/data/stores/useAppStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import type { FrameModel } from '@/types/FrameModelTypes'
import type { AdUnit } from '@/types/adUnitElementTypes'

/**
 * Load frame models from JSON file
 */
const loadFrameModels = async (): Promise<FrameModel> => {
  // ← Return FrameModel
  try {
    const module = await import('./framesModel.json')
    const modelData = module.default as FrameModel // ✅ Clean typing!

    console.log('📐 Loading frame models (structure)...')

    return modelData // ✅ Return entire structure
  } catch (error) {
    console.error('❌ Failed to load frame models:', error)
    throw error
  }
}

// Singleton state - ensures initialization only happens once
let isInitialized = false

export const useAppInitializer = (creativeId: string) => {
  const creativeAPI = useCreativeAPI()
  const appStore = useAppStore()
  const adUnitStore = useAdUnitStore()
  const suspenseManager = useSuspenseManager()

  appStore.setCreativeId(creativeId)

  /**
   * Step 2: Initialize bundle (images and data) from API
   */
  const initializeBundle = async (creativeId: string) => {
    // Fetch creative bundle from API (includes URL mapping)
    const bundle = await creativeAPI.getCreativeBundle(creativeId)

    // All URL mapping is handled in getCreativeBundle, no caching needed
    console.log('✅ Bundle loaded: Images will load on-demand')

    return bundle
  }

  const initializeApp = async (): Promise<boolean> => {
    if (isInitialized) {
      console.log('✅ App already initialized, skipping...')
      return true
    }

    try {
      // Reset suspense states
      suspenseManager.setBundleReady(false)

      console.log('🚀 Initializing app with creative:', creativeId)

      // Step 1: Load frame models and store them
      const { stage, adUnits: modelAdUnits } = await loadFrameModels()

      // Initialize stores with loaded data
      appStore.setStage(stage)
      appStore.setCreativeId(creativeId)
      // Frame models have partial elements, will be completed with creative data
      adUnitStore.setAdUnits(modelAdUnits as unknown as Record<string, AdUnit>)

      console.log('✅ Step 1: Frame models loaded and stored successfully')

      // Step 2: Initialize bundle (images and data) from database
      await initializeBundle(creativeId)

      // Mark bundle as ready
      suspenseManager.setBundleReady(true)

      isInitialized = true
      return true
    } catch (error) {
      console.error('❌ App initialization failed:', error)
      isInitialized = false
      return false
    } finally {
      console.log('🏁 App initialization completed')
    }
  }

  return {
    initializeApp,
  }
}
