// composables/setupFrames/useAppInitializer.ts
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useCanvasStore } from '@/stores/canvas'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import type {
  AssetResponse,
  ImageMetadata,
  CreativeDataContent,
} from '@/composables/api/useCreativeAPI'
import type { AdUnit } from '@/stores/canvas'

/**
 * Centralized app initialization
 * Flow: Local Models → API Calls (Assets + Creative) → Populate Stores → Load Images
 */
export const useAppInitializer = () => {
  const { loadImage, initializeReservedImages } = useImageManager()
  const { setAdUnitsModels, setAdUnitsContent } = useCanvasData()
  const { setAllLayers } = useLayers()
  const canvasStore = useCanvasStore()
  const creativeAPI = useCreativeAPI()

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
   * Step 3: Populate stores with API data
   */
  const populateStores = (
    stage: { width: number; height: number },
    modelAdUnits: Record<string, AdUnit>,
    creativeData: CreativeDataContent,
  ) => {
    console.log('💾 Step 3: Populating stores...')

    // 1. Set stage dimensions
    canvasStore.stage = stage
    console.log(`📏 Stage: ${stage.width}x${stage.height}`)

    // 2. Set ad units structure (models only)
    setAdUnitsModels(modelAdUnits)

    // 3. Apply creative content to ad units
    setAdUnitsContent(creativeData.adUnits)

    // 4. Set layers
    setAllLayers(creativeData.layers)
    console.log(`📚 Layers: ${Object.keys(creativeData.layers).length}`)

    console.log(`💾 Stores populated`)
  }

  /**
   * Step 4: Load images in browser from asset paths
   */
  const loadImagesFromAssets = async (assets: AssetResponse[], imageMetadata: ImageMetadata[]) => {
    console.log('🌐 Step 4: Loading images in browser...')

    const loadPromises = assets.map(async (asset) => {
      const metadata = imageMetadata.find((img) => img.id === asset.id)
      if (metadata) {
        try {
          // Load image: id (UUID), url, type, name (key)
          await loadImage(asset.id, asset.path, metadata.type as 'image' | 'logo', metadata.name)
        } catch (error) {
          console.error(`❌ Failed to load ${metadata.name}:`, error)
        }
      }
    })

    await Promise.all(loadPromises)
    console.log(`✅ All images loaded`)
  }

  /**
   * Main initialization function
   * @param creativeId - The creative ID to load
   */
  const initializeApp = async (creativeId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6') => {
    try {
      console.log('🚀 Initializing app with creative:', creativeId)

      // Step 0: Initialize reserved images (fallback & uploadTemp)
      await initializeReservedImages()

      // Step 1: Load local structure
      const { stage, adUnits: modelAdUnits } = await loadFrameModels()

      // Step 2: Fetch data from API
      console.log('📡 Step 2: Fetching data from API...')
      const { assets, creativeData } = await creativeAPI.getCreativeBundle(creativeId)

      // Step 3: Populate stores
      populateStores(stage, modelAdUnits, creativeData)

      // Step 4: Load images in browser
      await loadImagesFromAssets(assets, creativeData.images)

      console.log('✅ App initialization complete!')
      console.log('📊 Summary:', {
        stage: `${stage.width}x${stage.height}`,
        adUnits: Object.keys(modelAdUnits).length,
        layers: Object.keys(creativeData.layers).length,
        images: assets.length,
      })

      return true
    } catch (error) {
      console.error('❌ App initialization failed:', error)
      return false
    }
  }

  return {
    initializeApp,
    loadFrameModels,
    populateStores,
    loadImagesFromAssets,
  }
}
