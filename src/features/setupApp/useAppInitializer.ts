import { useCreativeAPI } from '../api/useCreativeAPI'
import { useAppStore } from '@/data/stores/useAppStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useImageService } from '@/data/services/useImageService'
import { useImageUrlResolver } from '@/features/imagesManager/useImageUrlResolver'

import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import { useContentTransformer } from '@/data/services/useHelperContentData'
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
  const imageService = useImageService()
  const imageUrlResolver = useImageUrlResolver()
  const creativeAPI = useCreativeAPI()
  const appStore = useAppStore()
  const adUnitStore = useAdUnitStore()
  const suspenseManager = useSuspenseManager()
  const { importFromCreativeContentData } = useContentTransformer()

  appStore.setCreativeId(creativeId)

  /**
   * Step 2: Initialize bundle (images and data) from API
   */
  const initializeBundle = async (creativeId: string) => {
    // Reset image cache state
    imageService.clearCache()
    suspenseManager.setImagesCached(false)

    // Fetch creative bundle from API
    const bundle = await creativeAPI.getCreativeBundle(creativeId)

    // Import content data to stores
    importFromCreativeContentData(bundle.creativeData)

    // Resolve image URLs from bundle
    const imagesToCache = imageUrlResolver.resolveImagesToCache(bundle)

    console.log(
      `🔍 ImageService: ${imagesToCache.length}/${bundle.creativeData.images.length} images resolved for caching`,
    )

    // Cache all resolved images
    if (imagesToCache.length > 0) {
      await imageService.bulkCacheImages(imagesToCache)
    }

    // Check image loading results
    if (!imageService.areAllImagesReady()) {
      console.warn('⚠️ Not all images are ready after initialization')
    }

    suspenseManager.setImagesCached(true)
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
      suspenseManager.setImagesCached(false)

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
