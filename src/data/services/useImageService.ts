import { useImageStore } from '@/data/stores/useImageStore'
import { useImageCache } from '@/features/imagesManager/useImageCache'
import { useImageUpload } from '@/features/imagesManager/useImageUpload'
import type { ImageAsset } from '@/types/mainTypes'

/**
 * Image Service (Singleton)
 * Coordinates imageStore, imageCache, and imageUpload
 * Business logic layer for image management
 */

let sharedImageService: ReturnType<typeof createImageService> | null = null

export function useImageService() {
  if (!sharedImageService) {
    sharedImageService = createImageService()
  }
  return sharedImageService
}

function createImageService() {
  const imageStore = useImageStore()
  const imageCache = useImageCache()
  const imageUpload = useImageUpload()

  /**
   * Get full image metadata from store
   */
  const getImageMetadata = (imageID: string): ImageAsset | null => {
    const image = imageStore.getImage(imageID)
    if (!image) {
      console.warn(`⚠️ Image metadata not found: ${imageID}`)
      return null
    }
    return image
  }

  /**
   * Get natural dimensions from cached HTMLImageElement (SYNCHRONOUS)
   * ⚠️ Images must be pre-cached first!
   */
  const getNaturalDimensions = (imageID: string): { width: number; height: number } | null => {
    const img = imageCache.getCacheImage(imageID)

    // Check if it's the fallback image (means not cached)
    if (!imageCache.isImageReady(imageID)) {
      console.warn(`⚠️ Image not cached: ${imageID}`)
      return null
    }

    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
  }

  /**
   * Get aspect ratio from cached HTMLImageElement (SYNCHRONOUS)
   */
  const getAspectRatio = (imageID: string): number | null => {
    const img = imageCache.getCacheImage(imageID)
    if (!imageCache.isImageReady(imageID)) return null

    if (img.naturalHeight === 0) return null

    return img.naturalWidth / img.naturalHeight
  }

  /**
   * Get cached HTMLImageElement for canvas rendering (SYNCHRONOUS)
   * ⚠️ Images must be pre-cached first!
   */
  const getImageElement = (imageID: string): HTMLImageElement => {
    return imageCache.getCacheImage(imageID)
  }

  /**
   * Get images filtered by type
   */
  const getImagesByType = (type: 'image' | 'logo'): ImageAsset[] => {
    const imagesRecord = imageStore.getImagesByType(type)
    return Object.values(imagesRecord)
  }

  /**
   * Check if image exists in store
   */
  const isImageLoaded = (imageID: string): boolean => {
    return imageStore.getImage(imageID) !== null
  }

  /**
   * Update image altText
   */
  const updateImageAltText = (imageID: string, altText: string): void => {
    const image = imageStore.getImage(imageID)
    if (!image) {
      console.error(`❌ Cannot update altText: Image ${imageID} not found`)
      return
    }

    imageStore.updateImage(imageID, { ...image, altText })
    console.log(`✏️ Updated altText for ${imageID}: ${altText}`)
  }

  /**
   * Update image name
   */
  const updateImageName = (imageID: string, name: string): void => {
    const image = imageStore.getImage(imageID)
    if (!image) {
      console.error(`❌ Cannot update name: Image ${imageID} not found`)
      return
    }

    imageStore.updateImage(imageID, { ...image, name })
    console.log(`✏️ Updated name for ${imageID}: ${name}`)
  }

  /**
   * Remove image from store
   */
  const removeImage = (imageID: string): void => {
    imageStore.removeImage(imageID)
    console.log(`🗑️ Removed image: ${imageID}`)
  }

  /**
   * Get all images from store
   */
  const getAllImages = (): Record<string, ImageAsset> => {
    return imageStore.getAllImages()
  }

  /**
   * Get image IDs
   */
  const getImageIds = (): string[] => {
    return imageStore.getImageIds()
  }

  /**
   * Check if any images exist
   */
  const hasImages = (): boolean => {
    return imageStore.hasImages()
  }

  /**
   * Get images count
   */
  const getImagesCount = (): number => {
    return imageStore.getImagesCount()
  }

  // TODO: Image validation
  const validateImageForUpload = (): { valid: boolean; error?: string } => {
    // needs a parameter like file: File
    // TODO: Implement validation
    // - Check file type (jpg, png, gif, webp)
    // - Check dimensions (min/max width/height)
    // - Check file size (max MB)
    console.warn('⚠️ Image validation not yet implemented')
    return { valid: true }
  }

  return {
    // Metadata queries
    getImageMetadata,
    getNaturalDimensions,
    getAspectRatio,
    getAllImages,
    getImageIds,
    hasImages,
    getImagesCount,

    // Element access (cache coordination)
    getImageElement,

    // Type filtering
    getImagesByType,

    // Status checks
    isImageLoaded,

    // Updates
    updateImageAltText,
    updateImageName,
    removeImage,

    // Validation (TODO)
    validateImageForUpload,

    // Re-export cache methods
    isImageReady: imageCache.isImageReady,
    areAllImagesReady: imageCache.areAllImagesReady,
    clearCache: imageCache.clearCache,

    // Re-export upload methods
    promoteTempToList: imageUpload.promoteTempToList,
    setTemporaryImage: imageUpload.setTemporaryImage,
    getUploadTempImage: imageUpload.getUploadTempImage,
    hasUploadTemp: imageUpload.hasUploadTemp,
    updateUploadTempAltText: imageUpload.updateUploadTempAltText,
    clearUploadTemp: imageUpload.clearUploadTemp,

    // Re-export bulk caching (used by app initializer)
    bulkCacheImages: imageCache.bulkCacheImages,
  }
}
