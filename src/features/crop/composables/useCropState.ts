import { ref } from 'vue'
import { useViewState } from '@/features/stage/composables/useViewState'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useFieldService } from '@/data/services/useFieldService'
import { useImageService } from '@/data/services/useImageService'
import { useRendering } from '@/features/stage/composables/useRendering'
import type { FrameConfig } from '@/types/cropTypes'

interface FullImageData {
  imageUrl: string
  imageDimensions: { width: number; height: number }
  fullImageConfig: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Singleton state
const isCropActive = ref(false)
const fullImageData = ref<FullImageData | null>(null)
const imageElement = ref<HTMLImageElement | null>(null)
const position = ref({ x: 0, y: 0 })

let sharedCropStateInstance: ReturnType<typeof createCropState> | null = null

export function useCropState() {
  if (!sharedCropStateInstance) {
    sharedCropStateInstance = createCropState()
  }
  return sharedCropStateInstance
}

function createCropState() {
  const viewState = useViewState()
  const adUnitStore = useAdUnitStore()
  const fieldService = useFieldService()
  const imageService = useImageService()
  const rendering = useRendering()

  const enterCrop = () => {
    console.log('✅ Entering crop mode')
    isCropActive.value = true
  }

  const exitCrop = () => {
    console.log('✅ Exiting crop mode')
    isCropActive.value = false
    // Reset state when exiting
    fullImageData.value = null
    imageElement.value = null
  }

  // Initialize crop with frame config
  const initializeCrop = async (frameConfig: FrameConfig) => {
    try {
      // Load full image data first
      const data = await calculateFullImagePosition(frameConfig)
      if (data) {
        fullImageData.value = data

        // Use calculated position, not frame position!
        position.value = {
          x: data.fullImageConfig.x,
          y: data.fullImageConfig.y,
        }

        // Load image element
        const img = new Image()
        img.onload = () => {
          imageElement.value = img
        }
        img.src = data.imageUrl
      }
    } catch (error) {
      console.error('❌ Failed to initialize crop:', error)
    }
  }

  // Update position
  const updatePosition = (newPosition: { x: number; y: number }) => {
    position.value = newPosition
  }

  const filterChange = (
    liveImageConfig: FrameConfig,
    proposedFrameConfig: FrameConfig,
  ): FrameConfig | null => {
    console.log('🔍 filterChange - liveImageConfig:', liveImageConfig)
    console.log('🔍 filterChange - proposedFrameConfig:', proposedFrameConfig)

    // Geometry validation: proposed must fully contain live
    const doesProposedContainLive = (proposed: FrameConfig, live: FrameConfig) => {
      return (
        proposed.x <= live.x && // left edge of proposed is left of or equal to left edge of live
        proposed.y <= live.y && // top edge of proposed is above or equal to top edge of live
        proposed.x + proposed.width >= live.x + live.width && // right edge of proposed is right of or equal to right edge of live
        proposed.y + proposed.height >= live.y + live.height // bottom edge of proposed is below or equal to bottom edge of live
      )
    }

    const shouldAllowChange = doesProposedContainLive(proposedFrameConfig, liveImageConfig)

    if (!shouldAllowChange) {
      console.log('🚫 Blocking proposed change - would expose crop area outside image')
      return null // Skip movement entirely
    } else {
      console.log('✅ Allowing proposed change - crop area stays within image bounds')
      return proposedFrameConfig // Allow new position
      //return null
    }
  }

  // Handle clean frame config changes from CropView
  const handleFrameChange = (frameConfig: FrameConfig) => {
    if (!fullImageData.value) {
      console.log('❌ No fullImageData available for handleFrameChange')
      return
    }

    const currentAdUnit = viewState.currentAdUnit.value
    if (!currentAdUnit) {
      console.log('❌ No current adUnit for handleFrameChange')
      return
    }

    // Get live transparent image screen position directly
    const renderableElements = rendering.getRenderableElements(currentAdUnit.id)
    const imageRenderData = renderableElements.find((el) => el.id === 'image')

    if (!imageRenderData) {
      console.log('❌ No image render data found')
      return
    }

    // Live transparent image position (affected by zoom/pan)
    const liveImageConfig: FrameConfig = {
      x: imageRenderData.config.x as number,
      y: imageRenderData.config.y as number,
      width: imageRenderData.config.width as number,
      height: imageRenderData.config.height as number,
    }

    // Call filterChange with live vs dragged positions
    const validatedFrameConfig = filterChange(liveImageConfig, frameConfig)

    // Return validated config for CropView to apply (or null to skip)
    return validatedFrameConfig
  }

  // Calculate full image position to match current crop
  const calculateFullImagePosition = async (frameConfig: FrameConfig) => {
    try {
      const currentAdUnit = viewState.currentAdUnit.value
      if (!currentAdUnit) return null

      // Get image data
      const imageID = fieldService.getFieldValue('image', 'imageID')
      if (!imageID) return null

      // Get crop data and image dimensions
      const cropData = adUnitStore.getCropData(currentAdUnit.id)
      const imageDimensions = await imageService.getNaturalDimensions(imageID)
      const imageUrl = imageService.getImageUrl(imageID)

      if (!cropData || !imageDimensions || !imageUrl) return null

      // Calculate scale and position
      const scale = frameConfig.width / cropData.width

      const fullImageX = frameConfig.x - cropData.x * scale
      const fullImageY = frameConfig.y - cropData.y * scale

      return {
        imageUrl,
        imageDimensions,
        cropData,
        fullImageConfig: {
          x: fullImageX,
          y: fullImageY,
          width: imageDimensions.width * scale,
          height: imageDimensions.height * scale,
        },
      }
    } catch (error) {
      console.error('❌ Error calculating full image position:', error)
      return null
    }
  }

  return {
    // State
    isCropActive,
    fullImageData,
    imageElement,
    position,

    // Actions
    enterCrop,
    exitCrop,
    initializeCrop,
    updatePosition,
    handleFrameChange,

    // Calculations
    calculateFullImagePosition,
  }
}
