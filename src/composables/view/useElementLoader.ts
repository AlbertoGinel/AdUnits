// composables/view/useElementLoader.ts
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCropping } from '@/composables/Tools/useCropping'

/**
 * Handles element-specific loading and state
 * Image loading, cropping state, etc.
 */
export function useElementLoader() {
  const { getImage } = useImageManager()
  const cropping = useCropping()

  /**
   * Get loaded HTMLImageElement for an image ID
   */
  const getLoadedImage = (imageId?: string): HTMLImageElement | null => {
    if (!imageId) return null
    const imageData = getImage(imageId)
    return imageData?.image || null
  }

  /**
   * Check if element is currently being cropped
   */
  const isElementCropping = (elementId: string): boolean => {
    return cropping.isCropping.value && elementId === 'image'
  }

  /**
   * Check if image is loaded and ready
   */
  const isImageLoaded = (imageId?: string): boolean => {
    return !!getLoadedImage(imageId)
  }

  return {
    getLoadedImage,
    isElementCropping,
    isImageLoaded,
  }
}
