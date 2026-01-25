import { useImageStore } from '@/data/stores/useImageStore'
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

  // In promoteTempToList - accept the URL directly:
  const promoteTempToList = (realUUID: string, realUrl: string): string | null => {
    const tempUpload = imageStore.getUploadTemp()
    if (tempUpload) {
      const newImage: ImageAsset = {
        imageID: realUUID,
        type: tempUpload.type,
        name: tempUpload.name,
        altText: tempUpload.altText,
        url: realUrl, // ✅ Use the URL from upload response
      }

      imageStore.addImage(newImage)
      return realUUID
    }
    return null
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

    getUploadTempImage,
    hasUploadTemp,
    updateUploadTempAltText,
    clearUploadTemp,
  }
}
