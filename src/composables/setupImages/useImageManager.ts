// composables/setupImages/useImageManager.ts
import { ref } from 'vue'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import type { AssetResponse, ImageMetadata } from '@/composables/api/useCreativeAPI'
import type { CreativeContentData } from '@/types/creative'

/**
 * Robust ID-centric Image Manager
 * Coordinates with useCreativeAPI for complete image asset management
 * Provides synchronous image access after initialization
 */

interface CachedImage {
  id: string
  url: string
  type: 'image' | 'logo'
  name: string
  element: HTMLImageElement
  status: 'loading' | 'loaded' | 'error'
  lastUsed: number
}

interface ImageCacheMap {
  [imageId: string]: CachedImage
}

interface ImageManagerErrorData {
  type: string
  culprit: string
  error?: string
  imageId?: string
  url?: string
  creativeId?: string
}

// Event emitters for error communication
const imageManagerEvents = {
  emit: (
    type: string,
    data: ImageManagerErrorData | { creativeId?: string; totalImages?: number },
  ) => {
    const event = new CustomEvent(`image-manager-${type}`, { detail: data })
    window.dispatchEvent(event)
  },
}

// Singleton instance
let sharedImageManager: ReturnType<typeof createImageManager> | null = null

export function useImageManager() {
  if (!sharedImageManager) {
    sharedImageManager = createImageManager()
  }
  return sharedImageManager
}

function createImageManager() {
  // Internal state
  const imageCache = ref<ImageCacheMap>({})
  const isInitialized = ref(false)
  const isReady = ref(false)
  const fallbackImage = ref<HTMLImageElement | null>(null)
  const cachedCreativeData = ref<CreativeContentData | null>(null)

  // Creative API integration
  const creativeAPI = useCreativeAPI()

  /**
   * Create fallback image element with special ID
   */
  const createFallbackImage = (): HTMLImageElement => {
    if (fallbackImage.value) {
      return fallbackImage.value
    }

    const img = new Image()
    img.src = '/Fallback.png'

    fallbackImage.value = img
    return img
  }

  /**
   * Initialize image manager with creative bundle
   * Calls useCreativeAPI and handles complete initialization
   */
  const initialize = async (creativeId: string): Promise<void> => {
    console.log('🖼️ ImageManager: Initializing with creative:', creativeId)

    try {
      // Reset state
      isInitialized.value = false
      isReady.value = false
      imageCache.value = {}

      // Fetch creative bundle from API
      const bundle = await creativeAPI.getCreativeBundle(creativeId)

      console.log('📦 ImageManager: Got bundle:', {
        assets: bundle.assets.length,
        images: bundle.creativeData.images.length,
      })

      // Validate data integrity
      const assetMap = new Map(bundle.assets.map((asset) => [asset.id, asset]))
      //const imageMap = new Map(bundle.creativeData.images.map((img) => [img.id, img]))

      // Check for mismatches
      const validImages: Array<{ asset: AssetResponse; metadata: ImageMetadata }> = []

      for (const imageMetadata of bundle.creativeData.images) {
        const asset = assetMap.get(imageMetadata.id)

        if (!asset) {
          console.warn('⚠️ Image metadata without corresponding asset:', imageMetadata.id)
          imageManagerEvents.emit('error', {
            type: 'integrity-mismatch',
            culprit: 'missing asset',
            imageId: imageMetadata.id,
            creativeId,
          })
          continue
        }

        if (asset.error) {
          console.warn('⚠️ Asset has error:', asset.id, asset.error)
          imageManagerEvents.emit('error', {
            type: 'asset-error',
            culprit: 'asset endpoint',
            error: asset.error,
            imageId: asset.id,
            creativeId,
          })
          continue
        }

        validImages.push({ asset, metadata: imageMetadata })
      }

      console.log(
        `🔍 ImageManager: ${validImages.length}/${bundle.creativeData.images.length} images are valid`,
      )

      // Cache creative data for external access
      cachedCreativeData.value = bundle.creativeData

      // Start bulk caching immediately
      await bulkCacheImages(validImages, creativeId)

      isInitialized.value = true
      console.log('✅ ImageManager: Initialization complete')
    } catch (error) {
      console.error('❌ ImageManager: Initialization failed:', error)

      imageManagerEvents.emit('error', {
        type: 'initialization-failure',
        culprit: 'image manager',
        error: error instanceof Error ? error.message : 'Unknown error',
        creativeId,
      })

      throw error
    }
  }

  /**
   * Bulk cache all valid images
   */
  const bulkCacheImages = async (
    validImages: Array<{ asset: AssetResponse; metadata: ImageMetadata }>,
    creativeId: string,
  ): Promise<void> => {
    console.log('🚀 ImageManager: Starting bulk cache for', validImages.length, 'images')

    // Create cache entries for all images
    const loadPromises = validImages.map(({ asset, metadata }) => {
      const img = new Image()

      const cacheEntry: CachedImage = {
        id: asset.id,
        url: asset.path,
        type: metadata.type as 'image' | 'logo',
        name: metadata.name,
        element: img,
        status: 'loading',
        lastUsed: Date.now(),
      }

      // Add to cache immediately
      imageCache.value[asset.id] = cacheEntry

      // Return loading promise
      return new Promise<void>((resolve) => {
        img.onload = () => {
          cacheEntry.status = 'loaded'
          console.log('✅ Image cached:', asset.id, metadata.name)
          resolve()
        }

        img.onerror = () => {
          cacheEntry.status = 'error'
          console.error('❌ Image cache failed:', asset.id, asset.path)

          imageManagerEvents.emit('error', {
            type: 'cache-failure',
            culprit: 'image loading',
            error: 'Failed to load image',
            imageId: asset.id,
            url: asset.path,
            creativeId,
          })

          resolve() // Don't block other images
        }

        // Start loading
        img.src = asset.path
      })
    })

    // Wait for all images to complete (load or error)
    await Promise.all(loadPromises)

    // Check if all images loaded successfully
    const stats = getCacheStats()

    if (stats.error > 0) {
      console.warn(`⚠️ ImageManager: ${stats.error} images failed to load`)
    }

    isReady.value = true

    imageManagerEvents.emit('images-ready', {
      creativeId,
      totalImages: stats.total,
    })

    console.log('✅ ImageManager: Bulk caching complete:', stats)
  }

  /**
   * Get image element by ID (synchronous)
   * Returns HTMLImageElement if ready, fallback if not found/failed
   */
  const getImageOptimized = (imageId: string): HTMLImageElement => {
    // Handle special fallback ID
    if (imageId === '__fallback__') {
      return createFallbackImage()
    }

    const cached = imageCache.value[imageId]

    if (!cached) {
      console.warn('🖼️ ImageManager: Image not found:', imageId)
      return createFallbackImage()
    }

    if (cached.status === 'error') {
      console.warn('🖼️ ImageManager: Image failed to load:', imageId)
      return createFallbackImage()
    }

    if (cached.status === 'loading') {
      console.warn('🖼️ ImageManager: Image still loading:', imageId)
      return createFallbackImage()
    }

    // Update usage timestamp
    cached.lastUsed = Date.now()

    return cached.element
  }

  /**
   * Check if specific image is ready
   */
  const isImageReady = (imageId: string): boolean => {
    if (imageId === '__fallback__') {
      return true
    }

    const cached = imageCache.value[imageId]
    return cached ? cached.status === 'loaded' : false
  }

  /**
   * Check if all images are ready
   */
  const areAllImagesReady = (): boolean => {
    return isReady.value
  }

  /**
   * Get image metadata by ID
   */
  const getImageMetadata = (imageId: string): { id: string; type: string; name: string } | null => {
    const cached = imageCache.value[imageId]

    if (!cached) {
      return null
    }

    return {
      id: cached.id,
      type: cached.type,
      name: cached.name,
    }
  }

  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    const stats = {
      total: 0,
      loaded: 0,
      loading: 0,
      error: 0,
    }

    for (const cached of Object.values(imageCache.value)) {
      stats.total++
      stats[cached.status]++
    }

    return stats
  }

  /**
   * Get all cached image IDs
   */
  const getAllImageIds = (): string[] => {
    return Object.keys(imageCache.value)
  }

  /**
   * Clear cache and reset state
   */
  const clearCache = () => {
    imageCache.value = {}
    isInitialized.value = false
    isReady.value = false
    fallbackImage.value = null
    cachedCreativeData.value = null
    console.log('🧹 ImageManager: Cache cleared')
  }

  /**
   * Get cached creative data
   */
  const getCreativeData = () => {
    return cachedCreativeData.value
  }

  /**
   * Get current initialization status
   */
  const getStatus = () => {
    return {
      isInitialized: isInitialized.value,
      isReady: isReady.value,
      cacheStats: getCacheStats(),
    }
  }

  return {
    // State
    isInitialized,
    isReady,

    // Core methods
    initialize,
    getImageOptimized,

    // Status checks
    isImageReady,
    areAllImagesReady,
    getStatus,

    // Metadata
    getImageMetadata,
    getAllImageIds,
    getCreativeData,

    // Utilities
    getCacheStats,
    clearCache,
  }
}
