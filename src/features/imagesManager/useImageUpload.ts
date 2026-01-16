import { useImageStore } from '@/data/stores/useImageStore'
import { useImageCache } from './useImageCache'
import type { ImageAsset } from '@/types/mainTypes'

/**
 * Image Upload Manager (Singleton)
 * Handles temporary upload preview and confirmation workflow
 */

let sharedImageUpload: ReturnType<typeof createImageUpload> | null = null

export function useImageUpload() {
  if (!sharedImageUpload) {
    sharedImageUpload = createImageUpload()
  }
  return sharedImageUpload
}

function createImageUpload() {
  const imageStore = useImageStore()
  const imageCache = useImageCache()

  /**
   * Cache temporary image for upload preview
   * Creates blob URL and stores in uploadTemp (does NOT add to permanent store)
   */
  const setTemporaryImage = async (file: File, type: 'image' | 'logo'): Promise<string> => {
    try {
      console.log(`📤 Caching temporary ${type}:`, file.name)

      // Generate temporary ID
      const tempId = `temp_${Date.now()}`

      // Create blob URL
      const blobUrl = URL.createObjectURL(file)

      // Cache the image element
      await imageCache.getCacheImage(blobUrl)

      // Store in uploadTemp (preview state)
      const tempImage: ImageAsset = {
        imageID: tempId,
        url: blobUrl,
        type,
        name: file.name,
        altText: '',
      }

      imageStore.setUploadTemp(tempImage)

      console.log(`✅ Temporary ${type} cached:`, tempId)
      return tempId
    } catch (error) {
      console.error('❌ Failed to cache temporary image:', error)
      throw error
    }
  }

  const promoteTempToList = (): string | null => {
    const temp = imageStore.getUploadTemp()
    if (temp) {
      imageStore.addImage(temp)
      return temp.imageID
    } else {
      return null
    }
  }

  /**
   * Rollback promotion if upload fails
   */
  const rollbackPromotion = (imageID: string): void => {
    imageStore.removeImage(imageID)
    console.log(`⏮️ Rolled back promoted image: ${imageID}`)
  }

  /**
   * Get current uploadTemp image
   */
  const getUploadTempImage = (): ImageAsset | null => {
    return imageStore.getUploadTemp()
  }

  /**
   * Check if uploadTemp exists
   */
  const hasUploadTemp = (): boolean => {
    return imageStore.hasUploadTemp()
  }

  /**
   * Update altText in uploadTemp
   */
  const updateUploadTempAltText = (altText: string): void => {
    const temp = imageStore.getUploadTemp()
    if (temp) {
      imageStore.setUploadTemp({ ...temp, altText })
    }
  }

  /**
   * Clear uploadTemp and revoke blob URL
   */
  const clearUploadTemp = (): void => {
    const temp = imageStore.getUploadTemp()
    if (temp) {
      // Revoke blob URL to free memory
      if (temp.url.startsWith('blob:')) {
        URL.revokeObjectURL(temp.url)
      }
      imageStore.clearUploadTemp()
      console.log('🧹 Upload temp cleared')
    }
  }

  return {
    setTemporaryImage,
    promoteTempToList,
    rollbackPromotion,

    getUploadTempImage,
    hasUploadTemp,
    updateUploadTempAltText,
    clearUploadTemp,
  }
}
