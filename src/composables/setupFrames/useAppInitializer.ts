// composables/setupFrames/useAppInitializer.ts
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import type { CreativeBundle } from '@/composables/api/useCreativeAPI'
import type { ImageMetadata } from '@/types/creative'
import type { AdUnit } from '@/stores/canvas'

/**
 * Centralized app initialization & lifecycle management
 * Flow: Local Models → API Calls (Assets + Creative) → Populate Stores → Load Images
 * Called from main.ts - not from components!
 */

// Singleton state - ensures initialization only happens once
let isInitializing = false
let isInitialized = false

export const useAppInitializer = () => {
  const imageManager = useImageManager()
  const creativeAPI = useCreativeAPI()
  const {
    importFromCreativeContentData,
    getStage,
    setAdUnits,
    setStage,
    setCreativeId,
    getAdUnits,
  } = useCanvasData()
  const suspenseManager = useSuspenseManager()

  /**
   * Step 1: Load frame models (structure/layout) - ALWAYS LOCAL
   */
  const loadFrameModels = async () => {
    try {
      const module = await import('./framesModel.json')
      const modelData = module.default

      console.log('📐 Step 1: Loading frame models (structure)...')

      return {
        stage: modelData.stage as { width: number; height: number },
        adUnits: modelData.adUnits as Record<string, AdUnit>,
      }
    } catch (error) {
      console.error('❌ Failed to load frame models:', error)
      throw error
    }
  }

  /**
   * Step 3: Initialize images from API
   */
  const initializeImages = async (creativeId: string) => {
    console.log('🖼️ Step 3: Initializing image manager...')

    // Reset image manager state
    imageManager.clearCache()
    suspenseManager.setImagesCached(false)

    // Fetch creative bundle from API
    const bundle = await creativeAPI.getCreativeBundle(creativeId)

    console.log('📦 ImageManager: Got bundle:', {
      assets: bundle.assets.length,
      images: bundle.creativeData.images.length,
    })

    // Validate data integrity and cache images
    const assetMap = new Map(bundle.assets.map((asset) => [asset.id, asset]))

    // Check for mismatches
    const validImages: Array<{
      asset: CreativeBundle['assets'][0]
      metadata: ImageMetadata
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

    // Cache all valid images (delegate to imageManager)
    if (validImages.length > 0) {
      await imageManager.bulkCacheImages(validImages)
    }

    // Check image loading results
    if (!imageManager.areAllImagesReady()) {
      console.warn('⚠️ Not all images are ready after initialization')
    }

    return bundle
  }

  /**
   * Wait for canvas to have dimensions
   * This ensures the Konva stage is mounted and sized before zooming
   */
  const waitForCanvasDimensions = (): Promise<void> => {
    return new Promise((resolve) => {
      const checkDimensions = () => {
        const stage = getStage()
        if (stage && stage.width > 0 && stage.height > 0) {
          console.log('✅ Canvas dimensions ready:', `${stage.width}x${stage.height}`)
          resolve()
        } else {
          requestAnimationFrame(checkDimensions)
        }
      }
      checkDimensions()
    })
  }

  /**
   * Main initialization function
   * Should be called once from main.ts after Vue mounts
   * @param creativeId - The creative ID to load
   */
  const initializeApp = async (creativeId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6') => {
    if (isInitialized) {
      console.log('✅ App already initialized, skipping...')
      return true
    }

    if (isInitializing) {
      console.log('⏳ App initialization in progress, waiting...')
      while (isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return isInitialized
    }

    isInitializing = true

    try {
      console.log('🚀 Initializing app with creative:', creativeId)

      // Reset suspense states
      suspenseManager.setBundleReady(false)
      suspenseManager.setImagesCached(false)

      // Step 1: Clear previous session
      console.log('🧹 Clearing previous session...')
      imageManager.clearCache()
      console.log('✅ Cache cleared')

      // Step 2: Load local structure
      const { stage, adUnits: modelAdUnits } = await loadFrameModels()

      // ✅ Step 2.1: Actually populate the Pinia store with frame models
      setStage(stage)
      setAdUnits(modelAdUnits)
      setCreativeId(creativeId)

      console.log('✅ Frame models loaded to store:', Object.keys(modelAdUnits))

      // Step 3: Initialize image manager (API calls + image caching)
      const bundle = await initializeImages(creativeId)

      // Step 4: Populate stores with the bundle we already fetched
      console.log('📊 Step 4: Populating stores...')
      const bundleCreativeData = bundle.creativeData

      if (!bundleCreativeData) {
        throw new Error('Creative data not available from API')
      }

      // ✅ Debug: Check what's in store before import
      console.log('🔍 Ad units in store before import:', Object.keys(getAdUnits()))

      importFromCreativeContentData(bundleCreativeData)

      // Step 5: Wait for canvas to render with proper dimensions
      await waitForCanvasDimensions()

      // Step 6: NOW signal that everything is ready
      // This triggers the skeleton to disappear and canvas to render
      suspenseManager.setBundleReady(true)

      console.log('✅ App initialization complete!')
      const finalImageStats = imageManager.getCacheStats()
      console.log('📊 Summary:', {
        stage: `${stage.width}x${stage.height}`,
        adUnits: Object.keys(modelAdUnits).length,
        layers: Object.keys(bundleCreativeData.layers).length,
        images: `${finalImageStats.loaded}/${finalImageStats.total} loaded`,
      })

      // Check image loading results
      if (!imageManager.areAllImagesReady()) {
        console.warn('⚠️ Not all images are ready after initialization')
      }

      // Step 4: Populate stores with the bundle we already fetched
      console.log('📊 Step 4: Populating stores...')
      const creativeData = bundle.creativeData

      if (!creativeData) {
        throw new Error('Creative data not available from API')
      }

      // ✅ Debug: Check what's in store before import
      console.log('🔍 Ad units in store before import:', Object.keys(getAdUnits()))

      importFromCreativeContentData(creativeData)

      // Step 5: Wait for canvas to render with proper dimensions
      await waitForCanvasDimensions()

      // Step 6: NOW signal that everything is ready
      // This triggers the skeleton to disappear and canvas to render
      suspenseManager.setBundleReady(true)

      console.log('✅ App initialization complete!')
      const imageStats = imageManager.getCacheStats()
      console.log('📊 Summary:', {
        stage: `${stage.width}x${stage.height}`,
        adUnits: Object.keys(modelAdUnits).length,
        layers: Object.keys(creativeData.layers).length,
        images: `${imageStats.loaded}/${imageStats.total} loaded`,
      })

      isInitialized = true
      return true
    } catch (error) {
      console.error('❌ App initialization failed:', error)
      return false
    } finally {
      isInitializing = false
    }
  }

  return {
    initializeApp,
  }
}
