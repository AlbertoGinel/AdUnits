import { computed } from 'vue'
import { useCropState } from './useCropState'
import type { RenderableElement } from '@/features/stage/composables/useRendering'

// Singleton instance
let sharedRenderCropInstance: ReturnType<typeof createRenderCrop> | null = null

export function useRenderCrop() {
  if (!sharedRenderCropInstance) {
    sharedRenderCropInstance = createRenderCrop()
  }
  return sharedRenderCropInstance
}

function createRenderCrop() {
  const cropState = useCropState()

  // Full image config with current position
  const fullImageConfig = computed(() => {
    if (!cropState.fullImageData.value || !cropState.imageElement.value) return null

    return {
      x: cropState.position.value.x,
      y: cropState.position.value.y,
      width: cropState.fullImageData.value.fullImageConfig.width,
      height: cropState.fullImageData.value.fullImageConfig.height,
      image: cropState.imageElement.value,
      draggable: true,
    }
  })

  // Should show image (both data and element loaded)
  const shouldShowImage = computed(() => {
    return !!(cropState.fullImageData.value && cropState.imageElement.value)
  })

  // Initialize crop from component
  const initializeFromRenderData = async (renderData: RenderableElement) => {
    const frameConfig = {
      x: renderData.config.x as number,
      y: renderData.config.y as number,
      width: renderData.config.width as number,
      height: renderData.config.height as number,
    }
    await cropState.initializeCrop(frameConfig)
  }

  return {
    // Computed configs
    fullImageConfig,
    shouldShowImage,

    // Actions
    initializeFromRenderData,
  }
}
