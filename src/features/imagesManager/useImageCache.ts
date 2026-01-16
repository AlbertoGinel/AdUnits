import { ref } from 'vue'
import { useFallbackImage } from './usefallBackImage'

/**
 * Image Cache Manager (Singleton)
 * Manages HTMLImageElement loading and caching
 * Low-level technical layer - no business logic
 */

let sharedImageCache: ReturnType<typeof createImageCache> | null = null

export function useImageCache() {
  if (!sharedImageCache) {
    sharedImageCache = createImageCache()
  }
  return sharedImageCache
}

function createImageCache() {
  // Cache for loaded HTMLImageElement objects
  const imageElementCache = new Map<string, HTMLImageElement>()
  const isReady = ref(false)
  const fallbackImage = useFallbackImage()

  /**
   * Cache a single image
   * Returns cached HTMLImageElement
   */
  const setCacheImage = async (url: string, imageID: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        imageElementCache.set(imageID, img)
        console.log(`✅ Cached image: ${imageID} (${img.naturalWidth}x${img.naturalHeight})`)
        resolve(img)
      }

      img.onerror = (err) => {
        console.error(`❌ Failed to load image ${imageID}:`, err)
        reject(new Error(`Failed to load image: ${imageID}`))
      }

      img.src = url
    })
  }

  /**
   * Bulk cache multiple images
   * Takes array of imageID and url pairs
   */
  const bulkCacheImages = async (
    images: Array<{ imageID: string; url: string }>,
  ): Promise<void> => {
    console.log(`📦 Bulk caching ${images.length} images...`)

    const cachePromises = images.map(async ({ imageID, url }) => {
      try {
        await setCacheImage(url, imageID)
        return {
          imageID,
          success: true,
        }
      } catch (error) {
        console.warn(`⚠️ Failed to cache image ${imageID}:`, error)
        return {
          imageID,
          success: false,
          error,
        }
      }
    })

    const results = await Promise.all(cachePromises)

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`✅ Cached ${successful}/${images.length} images (${failed} failed)`)

    isReady.value = true
  }

  /**
   * Get cached image element (SYNCHRONOUS)
   * Returns fallback if not found
   * ⚠️ Images must be pre-cached via bulkCacheImages() first!
   */
  const getCacheImage = (imageID: string): HTMLImageElement => {
    const cached = imageElementCache.get(imageID)
    if (cached) return cached

    // Return fallback for missing images
    console.warn(`⚠️ Image not found in cache: ${imageID}, using fallback`)
    return fallbackImage.getFallbackImage()
  }

  /**
   * Check if specific image is cached and ready
   */
  const isImageReady = (imageID: string): boolean => {
    return imageElementCache.has(imageID)
  }

  /**
   * Check if all images are ready
   */
  const areAllImagesReady = (): boolean => {
    return isReady.value
  }

  /**
   * Clear cache and reset state
   */
  const clearCache = () => {
    imageElementCache.clear()
    isReady.value = false
    console.log('🧹 Image cache cleared')
  }

  return {
    // Core caching
    getCacheImage,
    bulkCacheImages,
    setCacheImage,

    // Status checks
    isImageReady,
    areAllImagesReady,
    isReady,

    // Utilities
    clearCache,
  }
}
