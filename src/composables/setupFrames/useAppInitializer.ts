// composables/setupFrames/useAppInitializer.ts
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import { useNotifications } from '@/composables/feedbackAsync/useNotifications'
import type { AdUnit } from '@/stores/canvas'

/**
 * Centralized app initialization
 * Flow: Local Models → API Calls (Assets + Creative) → Populate Stores → Load Images
 */
export const useAppInitializer = () => {
  const imageManager = useImageManager()
  const { importToCreativeContentData, getStage } = useCanvasData()
  const creativeAPI = useCreativeAPI()
  const notifications = useNotifications()

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
   * Step 5: Wait for canvas to have dimensions
   * This ensures the Konva stage is mounted and sized before zooming
   */
  const waitForCanvasDimensions = (): Promise<void> => {
    return new Promise((resolve) => {
      const checkDimensions = () => {
        const stage = getStage()
        if (stage && stage.width > 0 && stage.height > 0) {
          console.log('✅ Step 5: Canvas dimensions ready:', `${stage.width}x${stage.height}`)
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
   * @param creativeId - The creative ID to load
   */
  const initializeApp = (() => {
    let isInitializing = false
    let isInitialized = false

    return async (creativeId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6') => {
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

        // Step 1: Clear previous session
        console.log('🧹 Clearing previous session...')
        imageManager.clearCache()
        console.log('✅ Cache cleared')

        // Step 2: Load local structure
        const { stage, adUnits: modelAdUnits } = await loadFrameModels()

        // Step 3: Initialize image manager (API calls + image caching)
        console.log('🖼️ Step 3: Initializing image manager...')
        await imageManager.initialize(creativeId)

        // Check image loading results
        if (!imageManager.areAllImagesReady()) {
          console.warn('⚠️ Not all images are ready after initialization')

          // Show warning for failed images
          const stats = imageManager.getCacheStats()
          if (stats.error > 0) {
            notifications.showWarning(
              'Some images failed to load',
              `${stats.error} of ${stats.total} images couldn't be loaded`,
            )
          }
        }

        // Step 4: Get creative data from API and populate stores
        console.log('📊 Step 4: Populating stores...')
        const bundle = await creativeAPI.getCreativeBundle(creativeId)
        const creativeData = bundle.creativeData

        if (!creativeData) {
          throw new Error('Creative data not available from API')
        }

        importToCreativeContentData(stage, modelAdUnits, creativeData)

        // Step 5: Wait for canvas to render with proper dimensions
        await waitForCanvasDimensions()

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

        // Handle initialization failure
        notifications.showError(
          'App initialization failed',
          'Failed to load creative data. Please refresh the page.',
          [
            {
              label: 'Retry',
              action: async () => {
                await initializeApp(creativeId)
              },
            },
          ],
        )

        return false
      } finally {
        isInitializing = false
      }
    }
  })()

  return {
    initializeApp,
  }
}
