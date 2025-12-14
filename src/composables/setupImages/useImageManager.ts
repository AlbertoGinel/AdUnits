// composables/setupImages/useImageManager.ts
import { ref } from 'vue'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useImageStore } from '@/stores/useImageStore'
import type { AssetResponse, ImageMetadata } from '@/composables/api/useCreativeAPI'

/**
 * Robust ID-centric Image Manager
 * Coordinates with useCreativeAPI for complete image asset management
 * Provides synchronous image access after initialization
 */

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
  // State management
  const isInitialized = ref(false)
  const isReady = ref(false)
  const fallbackImage = ref<HTMLImageElement | null>(null)

  // Store integrations
  const creativeAPI = useCreativeAPI()
  const canvasData = useCanvasData()
  const imageStore = useImageStore()

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
      imageStore.clearImages()

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
   * Cache a single image (internal - no Pinia store addition)
   * Only loads the image and returns dimensions
   */
  const cacheImage = async (
    url: string,
  ): Promise<{ width: number; height: number; aspectRatio: number }> => {
    return new Promise<{ width: number; height: number; aspectRatio: number }>(
      (resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          }
          resolve(dimensions)
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        // Start loading
        img.src = url
      },
    )
  }

  /**
   * Bulk cache all valid images
   */
  const bulkCacheImages = async (
    validImages: Array<{ asset: AssetResponse; metadata: ImageMetadata }>,
    creativeId: string,
  ): Promise<void> => {
    console.log('🚀 ImageManager: Starting bulk cache for', validImages.length, 'images')

    // Cache all images - load them and add to Pinia store
    const loadPromises = validImages.map(async ({ asset, metadata }) => {
      try {
        const dimensions = await cacheImage(asset.path)

        // Add to Pinia store after successful load
        imageStore.addImage({
          id: asset.id,
          url: asset.path,
          name: metadata.name,
          type: metadata.type as 'image' | 'logo',
          dimensions: {
            width: dimensions.width,
            height: dimensions.height,
            naturalWidth: dimensions.width,
            naturalHeight: dimensions.height,
            aspectRatio: dimensions.aspectRatio,
          },
        })

        console.log('✅ Image cached:', asset.id, metadata.name)
      } catch {
        console.error('❌ Image cache failed:', asset.id, asset.path)
        imageManagerEvents.emit('error', {
          type: 'cache-failure',
          culprit: 'image loading',
          error: 'Failed to load image',
          imageId: asset.id,
          url: asset.path,
          creativeId,
        })
      }
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

    const imageData = imageStore.getImage(imageId)

    if (!imageData) {
      console.warn('🖼️ ImageManager: Image not found:', imageId)
      return createFallbackImage()
    }

    if (!imageData.dimensions) {
      console.warn('🖼️ ImageManager: Image not ready:', imageId)
      return createFallbackImage()
    }

    // Create image element from stored URL
    const img = new Image()
    img.src = imageData.url
    return img
  }

  /**
   * Check if specific image is ready
   */
  const isImageReady = (imageId: string): boolean => {
    if (imageId === '__fallback__') {
      return true
    }

    const imageData = imageStore.getImage(imageId)
    return imageData ? !!imageData.dimensions : false
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
    const imageData = imageStore.getImage(imageId)

    if (!imageData) {
      return null
    }

    // Ensure type and name are defined with fallbacks
    const type = imageData.type || 'image'
    const name = imageData.name || imageData.id

    return {
      id: imageData.id,
      type: type,
      name: name,
    }
  }

  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    const allImages = imageStore.getAllImages
    const stats = {
      total: allImages.length,
      loaded: 0,
      loading: 0,
      error: 0,
    }

    for (const imageData of allImages) {
      if (imageData.dimensions) {
        stats.loaded++
      } else {
        stats.loading++
      }
    }

    return stats
  }

  /**
   * Clear cache and reset state
   */
  const clearCache = () => {
    imageStore.clearImages()
    isInitialized.value = false
    isReady.value = false
    fallbackImage.value = null
    console.log('🧹 ImageManager: Cache cleared')
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

  /**
   * Get current image in bulk mode (internal)
   */
  const getCurrentImageBulk = (): string | null => {
    const layer = canvasData.getLayer('image')
    return layer?.defaultValue || null
  }

  /**
   * Get current image in focus mode for specific ad unit (internal)
   */
  const getCurrentImageFocusInternal = (adUnitId: string): string | null => {
    const element = canvasData.getElement(adUnitId, 'image')
    return element?.image || null
  }

  /**
   * Get images filtered by type
   */
  const getImagesByType = (type: 'image' | 'logo'): string[] => {
    const imagesRecord = imageStore.getImagesByType(type)
    return Object.keys(imagesRecord)
  }

  /**
   * Set current image in bulk mode (internal)
   */
  const setCurrentImageBulk = (imageId: string): void => {
    canvasData.updateLayer('image', { defaultValue: imageId })
  }

  /**
   * Set current image in focus mode for specific ad unit (internal)
   */
  const setCurrentImageFocusInternal = (adUnitId: string, imageId: string): void => {
    canvasData.updateElement(adUnitId, 'image', { image: imageId })
  }

  /**
   * Get current image (context-aware)
   * Automatically detects if we're in bulk or focus mode
   */
  const getCurrentImage = (): string | null => {
    const currentView = canvasData.getCurrentView()

    if (currentView === 'bulkMode') {
      return getCurrentImageBulk()
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = canvasData.getCurrentAdUnitId()
      if (!currentAdUnitId) return null
      return getCurrentImageFocusInternal(currentAdUnitId)
    }

    return null
  }

  /**
   * Set current image (context-aware)
   * Automatically detects if we're in bulk or focus mode
   */
  const setCurrentImage = (imageId: string): void => {
    const currentView = canvasData.getCurrentView()

    if (currentView === 'bulkMode') {
      setCurrentImageBulk(imageId)
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = canvasData.getCurrentAdUnitId()
      if (!currentAdUnitId) return
      setCurrentImageFocusInternal(currentAdUnitId, imageId)
    }
  }

  /**
   * Cache temporary image for upload preview
   * Only creates blob URL and caches, does NOT add to Pinia store
   */
  const cacheTemporaryImage = async (file: File): Promise<string> => {
    // Generate UUID for the image
    const imageId = `${crypto.randomUUID()}`

    // Create object URL for the file
    const url = URL.createObjectURL(file)

    // Get file name without extension for name
    const name = file.name.replace(/\.[^/.]+$/, '')

    try {
      // Only cache the image, don't add to store yet
      const dimensions = await cacheImage(url)

      // Store in uploadTemp with cached data
      imageStore.setUploadTempImage({
        id: imageId,
        url,
        name,
        type: 'image',
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
          naturalWidth: dimensions.width,
          naturalHeight: dimensions.height,
          aspectRatio: dimensions.aspectRatio,
        },
      })

      console.log('📁 Temporary image cached (uploadTemp only):', imageId, file.name)
      return imageId
    } catch (error) {
      console.error('❌ Failed to cache temporary image:', error)
      URL.revokeObjectURL(url)
      throw error
    }
  }

  /**
   * Add uploaded image to regular images after API success
   * Loads the image and adds to Pinia store
   */
  const addUploadedImage = async (
    assetId: string,
    path: string,
    type: 'image' | 'logo',
    name: string,
  ): Promise<void> => {
    try {
      // Cache the image first (load it)
      const dimensions = await cacheImage(path)

      // Add to Pinia store with dimensions
      imageStore.addImage({
        id: assetId,
        url: path,
        type,
        name,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
          naturalWidth: dimensions.width,
          naturalHeight: dimensions.height,
          aspectRatio: dimensions.aspectRatio,
        },
      })

      console.log('✅ Added uploaded image to store:', assetId)
    } catch (error) {
      console.error('❌ Failed to add uploaded image:', assetId, error)
      throw error
    }
  }

  /**
   * Get upload temporary image object
   */
  const getUploadTempImage = () => {
    return imageStore.reserved.uploadTemp
  }

  /**
   * Check if upload temporary image exists
   */
  const hasUploadTemp = (): boolean => {
    return imageStore.reserved.uploadTemp !== null
  }

  /**
   * Clear upload temporary image
   */
  const clearUploadTemp = (): void => {
    const uploadTemp = imageStore.reserved.uploadTemp
    if (uploadTemp) {
      // Remove from cache
      imageStore.removeImage(uploadTemp.id)
    }
    imageStore.setUploadTempImage(null)
  }

  return {
    // State
    isInitialized,
    isReady,

    // Core methods
    initialize,
    getImageOptimized,
    cacheTemporaryImage,
    addUploadedImage,

    // Upload temp management
    getUploadTempImage,
    hasUploadTemp,
    clearUploadTemp,

    // Status checks
    isImageReady,
    areAllImagesReady,
    getStatus,

    // Canvas integration
    getCurrentImage,
    setCurrentImage,
    getImagesByType,

    // Metadata
    getImageMetadata,

    // Utilities
    getCacheStats,
    clearCache,
  }
}
