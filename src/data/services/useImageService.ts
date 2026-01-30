import { useImageStore } from '@/data/stores/useImageStore'
import { useImageUpload } from '@/features/imagesManager/useImageUpload'
import { useAdUnitStore } from '../stores/useAdUnitStore'
import type { ImageAsset } from '@/types/mainTypes'

/**
 * Image Service (Singleton)
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
  const imageUpload = useImageUpload()
  const adUnitStore = useAdUnitStore()

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
   * Get image URL from imageID
   */
  const getImageUrl = (imageID: string): string | null => {
    const image = imageStore.getImage(imageID)
    if (!image?.url) {
      console.warn(`⚠️ Image URL not found: ${imageID}`)
      return null
    }
    return image.url
  }

  /**
   * Get natural dimensions from async image loading
   * Now ASYNCHRONOUS - returns Promise!
   */
  const getNaturalDimensions = async (
    imageID: string,
  ): Promise<{ width: number; height: number } | null> => {
    try {
      const image = imageStore.getImage(imageID)
      if (!image?.url) return null

      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = reject
        img.src = image.url
      })
    } catch (error) {
      console.warn(`⚠️ Failed to get dimensions for image: ${imageID}`, error)
      return null
    }
  }

  /**
   * Get aspect ratio from async image loading
   * Now ASYNCHRONOUS - returns Promise!
   */
  const getAspectRatio = async (imageID: string): Promise<number | null> => {
    try {
      const dimensions = await getNaturalDimensions(imageID)
      if (!dimensions) return null

      if (dimensions.height === 0) {
        console.warn(`⚠️ Image has zero height: ${imageID}`)
        return null
      }

      return dimensions.width / dimensions.height
    } catch (error) {
      console.warn(`⚠️ Failed to get aspect ratio for image: ${imageID}`, error)
      return null
    }
  }

  /**
   * Get HTMLImageElement for canvas rendering
   * Now ASYNCHRONOUS - loads if needed!
   */
  const getImageElement = async (imageID: string): Promise<HTMLImageElement> => {
    try {
      const image = imageStore.getImage(imageID)
      if (!image?.url) throw new Error(`No URL found for image: ${imageID}`)

      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = image.url
      })
    } catch (error) {
      console.error(`❌ Failed to get image element: ${imageID}`, error)
      throw error // Re-throw so caller can handle
    }
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
   * Update image name
   */
  const updateImageName = (imageID: string, name: string): void => {
    const image = imageStore.getImage(imageID)
    if (!image) {
      console.error(`❌ Cannot update name: Image ${imageID} not found`)
      return
    }

    // ✅ Pass the complete updated image object as one argument
    const updatedImage = { ...image, name }
    imageStore.updateImage(updatedImage)
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

  const canLoadImage = async (imageID: string): Promise<boolean> => {
    try {
      await getImageElement(imageID)
      return true
    } catch {
      return false
    }
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

  /**
   * Initialize crop data for an image in an adUnit
   * Gets all needed data and calculates cover crop in one clean flow
   */
  const initialCrop = async (adUnitID: string): Promise<void> => {
    console.log('lets do initialCrop')

    try {
      // 1. Get image ID using clean store method
      const imageID = adUnitStore.getImageOfAdUnit(adUnitID)

      if (!imageID) {
        console.warn(`⚠️ No image in adUnit ${adUnitID}`)
        return
      }

      // 2. Get image element for frame dimensions
      const imageElement = adUnitStore.getElement(adUnitID, 'image')
      const frameWidth = imageElement?.width
      const frameHeight = imageElement?.height

      if (!frameWidth || !frameHeight) {
        console.warn(`⚠️ No frame dimensions for adUnit ${adUnitID}`)
        return
      }

      // 3. Get image natural dimensions
      const imageDimensions = await getNaturalDimensions(imageID)

      if (!imageDimensions) {
        console.warn(`⚠️ Could not get image dimensions for ${imageID}`)
        return
      }

      // 4. Calculate cover crop (maintain aspect ratio, fill frame)
      const imageWidth = imageDimensions.width
      const imageHeight = imageDimensions.height

      const scaleX = frameWidth / imageWidth
      const scaleY = frameHeight / imageHeight
      const scale = Math.max(scaleX, scaleY) // Cover strategy

      const cropWidth = frameWidth / scale
      const cropHeight = frameHeight / scale
      const cropX = (imageWidth - cropWidth) / 2
      const cropY = (imageHeight - cropHeight) / 2

      const cropData = {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      }

      // 5. Update the element with new crop
      adUnitStore.updateElement(adUnitID, 'image', { cropData })

      console.log(`✅ Initial crop set for ${adUnitID}:`, cropData)
    } catch (error) {
      console.error(`❌ Failed to set initial crop for ${adUnitID}:`, error)
    }
  }

  return {
    // Metadata queries
    getImageMetadata,
    getImageUrl,
    getNaturalDimensions,
    getAspectRatio,
    getAllImages,
    getImageIds,
    hasImages,
    getImagesCount,
    canLoadImage,

    // Element access (cache coordination)
    getImageElement,

    // Type filtering
    getImagesByType,

    // Status checks
    isImageLoaded,

    // Crop operations
    initialCrop,

    // Updates
    updateImageName,
    removeImage,

    // Validation (TODO)
    validateImageForUpload,

    // Re-export upload methods
    promoteTempToList: imageUpload.promoteTempToList,
    setTemporaryImage: imageUpload.setTemporaryImage,
    getUploadTempImage: imageUpload.getUploadTempImage,
    hasUploadTemp: imageUpload.hasUploadTemp,
    clearUploadTemp: imageUpload.clearUploadTemp,
  }
}
