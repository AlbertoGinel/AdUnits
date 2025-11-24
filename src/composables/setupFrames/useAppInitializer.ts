// composables/setupFrames/useAppInitializer.ts
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import type { AdUnit, LayerDefinition } from '@/stores/canvas'

/**
 * Centralized app initialization
 * Loads data in correct order: Model → Images → Server Content
 */
export const useAppInitializer = () => {
  const { loadImage } = useImageManager()
  const { setAdUnits } = useCanvasData()
  const { setAllLayers } = useLayers()

  /**
   * Step 1: Load frame models (structure/layout)
   */
  const loadFrameModels = async () => {
    try {
      const module = await import('./framesModel.json')
      const modelData = module.default

      console.log('📐 Step 1: Loading frame models (structure)...')
      return modelData.adUnits as Record<string, AdUnit>
    } catch (error) {
      console.error('❌ Failed to load frame models:', error)
      throw error
    }
  }

  /**
   * Step 2: Load images from server data
   */
  const loadServerImages = async () => {
    try {
      const module = await import('./framesServer.json')
      const serverData = module.default

      console.log('🖼️ Step 2: Loading images from server...')

      if (!serverData.images || serverData.images.length === 0) {
        console.warn('⚠️ No images found in server data')
        return
      }

      // Load all images in parallel
      await Promise.all(
        serverData.images.map(async (imageInfo: { id: string; url: string; type: string }) => {
          try {
            const imageType = imageInfo.type as 'image' | 'logo' | undefined
            await loadImage(imageInfo.id, imageInfo.url, imageType)
          } catch (error) {
            console.error(`Failed to load image ${imageInfo.id}:`, error)
          }
        }),
      )

      console.log(`✅ Loaded ${serverData.images.length} images`)
    } catch (error) {
      console.error('❌ Failed to load server images:', error)
      throw error
    }
  }

  /**
   * Step 3: Load server content (text, crops, locks)
   */
  const loadServerContent = async () => {
    try {
      const module = await import('./framesServer.json')
      const serverData = module.default

      console.log('📝 Step 3: Loading server content...')
      return {
        adUnits: serverData.adUnits,
        layers: serverData.layers as Record<string, LayerDefinition>,
      }
    } catch (error) {
      console.error('❌ Failed to load server content:', error)
      throw error
    }
  }

  /**
   * Step 4: Merge model + content
   */
  const mergeModelAndContent = (
    models: Record<string, AdUnit>,
    content: {
      adUnits: Record<string, { elements: Record<string, Partial<Record<string, unknown>>> }>
      layers: Record<string, LayerDefinition>
    },
  ) => {
    console.log('🔀 Step 4: Merging model structure with server content...')

    const mergedAdUnits: Record<string, AdUnit> = {}

    Object.entries(models).forEach(([adUnitId, modelAdUnit]) => {
      const contentAdUnit = content.adUnits[adUnitId]

      if (!contentAdUnit) {
        console.warn(`No content found for ad unit: ${adUnitId}`)
        mergedAdUnits[adUnitId] = modelAdUnit
        return
      }

      // Merge elements (structure + content)
      const mergedElements = {} as Record<string, (typeof modelAdUnit.elements)[string]>

      Object.entries(modelAdUnit.elements).forEach(([elementId, modelElement]) => {
        const contentElement = contentAdUnit.elements[elementId]

        // Start with model (structure)
        mergedElements[elementId] = { ...modelElement } as typeof modelElement

        // Add content if available
        if (contentElement) {
          Object.assign(mergedElements[elementId], contentElement)
        }
      })

      mergedAdUnits[adUnitId] = {
        ...modelAdUnit,
        elements: mergedElements,
      }
    })

    return { adUnits: mergedAdUnits, layers: content.layers }
  }

  /**
   * Main initialization function
   * Call this on app start
   */
  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...')

      // Step 1: Load structure/layout
      const models = await loadFrameModels()

      // Step 2: Load images (must happen before content, so crops can be applied)
      await loadServerImages()

      // Step 3: Load content
      const content = await loadServerContent()

      // Step 4: Merge and apply to store
      const { adUnits, layers } = mergeModelAndContent(models, content)

      // Apply to store
      setAdUnits(adUnits)
      setAllLayers(layers)

      console.log('✅ App initialization complete!')
      console.log('📊 Loaded:', {
        adUnits: Object.keys(adUnits).length,
        layers: Object.keys(layers).length,
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
    loadServerImages,
    loadServerContent,
    mergeModelAndContent,
  }
}
