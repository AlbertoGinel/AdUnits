import { useImageManager } from '../imagesManager/useImageManager'
import { useCreativeAPI } from '../api/useCreativeAPI'
import { useAppStore } from '@/data/stores/useAppStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
//import { useImageStore } from '@/data/stores/useImageStore'
//import { useLayerStore } from '@/data/stores/useLayerStore'
import type { AdUnitsRecord } from '@/types/mainTypes'

import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import { useContentTransformer } from '@/data/services/useHelperContentData'

/**
 * Load frame models from JSON file
 */
const loadFrameModels = async () => {
  try {
    const module = await import('./framesModel.json')
    const modelData = module.default

    console.log('📐 Loading frame models (structure)...')

    return {
      stage: modelData.stage as { width: number; height: number },
      adUnits: modelData.adUnits as AdUnitsRecord,
    }
  } catch (error) {
    console.error('❌ Failed to load frame models:', error)
    throw error
  }
}

// Singleton state - ensures initialization only happens once
let isInitialized = false

export const useAppInitializer = (creativeId: string) => {
  const imageManager = useImageManager()
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
    // Reset image manager state
    imageManager.clearCache()
    suspenseManager.setImagesCached(false)

    // Fetch creative bundle from API
    const bundle = await creativeAPI.getCreativeBundle(creativeId)

    importFromCreativeContentData(bundle.creativeData)

    // Validate data integrity and cache images
    const assetMap = new Map(bundle.assets.map((asset) => [asset.id, asset]))

    // Check for mismatches
    const validImages: Array<{
      asset: (typeof bundle.assets)[0]
      metadata: (typeof bundle.creativeData.images)[0]
    }> = []

    for (const imageMetadata of bundle.creativeData.images) {
      const asset = assetMap.get(imageMetadata.id)

      if (!asset) {
        console.warn('⚠️ Image metadata without corresponding asset:', imageMetadata.id)
        continue
      }

      if (asset.error) {
        console.warn('⚠️ Asset has error:', asset.id, asset.error)
        continue
      }

      validImages.push({ asset, metadata: imageMetadata })
    }

    console.log(
      `🔍 ImageManager: ${validImages.length}/${bundle.creativeData.images.length} images are valid`,
    )

    // Cache all valid images
    if (validImages.length > 0) {
      await imageManager.bulkCacheImages(validImages)
    }

    // Check image loading results
    if (!imageManager.areAllImagesReady()) {
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
      adUnitStore.setAdUnits(modelAdUnits)

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
