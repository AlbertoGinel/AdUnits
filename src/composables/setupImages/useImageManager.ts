// composables/setupImages/useImageManager.ts
import { ref } from 'vue'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useImageStore } from '@/stores/useImageStore'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import type { AssetResponse, CreativeBundle } from '@/composables/api/useCreativeAPI'
import type { ImageMetadata } from '@/types/creative'

/**
 * Robust ID-centric Image Manager
 * Coordinates with useCreativeAPI for complete image asset management
 * Provides synchronous image access after initialization
 */

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

  // Cache for the actual, loaded HTMLImageElement objects
  const imageElementCache = new Map<string, HTMLImageElement>()

  // Store integrations
  const creativeAPI = useCreativeAPI()
  const canvasData = useCanvasData()
  const imageStore = useImageStore()
  const suspenseManager = useSuspenseManager()

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
   * Returns the fetched bundle for use by caller
   */
  const initialize = async (creativeId: string): Promise<CreativeBundle> => {
    console.log('🖼️ ImageManager: Initializing with creative:', creativeId)

    try {
      // Reset state
      isInitialized.value = false
      isReady.value = false
      imageStore.clearImages()
      suspenseManager.setImagesCached(false)

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
          continue
        }

        if (asset.error) {
          console.warn('⚠️ Asset has error:', asset.id, asset.error)
          continue
        }

        validImages.push({ asset, metadata: imageMetadata })
      }

      console.log(
        `🔍 ImageManager: ${validImages.length}/${bundle.creativeData.images.length} images are valid`,
      )

      // Start bulk caching immediately
      await bulkCacheImages(validImages)

      isInitialized.value = true
      console.log('✅ ImageManager: Initialization complete')

      return bundle
    } catch (error) {
      console.error('❌ ImageManager: Initialization failed:', error)
      suspenseManager.setImagesCached(false)
      throw error
    }
  }

  /**
   * Cache a single image (internal - no Pinia store addition)
   * Only loads the image and returns dimensions
   */
  const cacheImage = async (
    url: string,
    imageId: string,
  ): Promise<{ width: number; height: number; aspectRatio: number; element: HTMLImageElement }> => {
    return new Promise<{
      width: number
      height: number
      aspectRatio: number
      element: HTMLImageElement
    }>((resolve, reject) => {
      const img = new Image()

      img.onload = async () => {
        try {
          // CRITICAL: decode() ensures bitmap is ready for canvas operations
          await img.decode()
        } catch {
          // decode() can fail on some images, but they may still work
          console.warn(`⚠️ decode() failed for ${imageId}`)
        }

        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          element: img,
        }
        // Store the fully decoded element in the cache
        imageElementCache.set(imageId, img)
        resolve(dimensions)
      }

      img.onerror = (err) => {
        console.error(`Failed to load image: ${imageId}`, err)
        reject(err)
      }

      img.src = url
    })
  }

  /**
   * Bulk cache all valid images
   */
  const bulkCacheImages = async (
    validImages: Array<{ asset: AssetResponse; metadata: ImageMetadata }>,
  ): Promise<void> => {
    console.log('🚀 ImageManager: Starting bulk cache for', validImages.length, 'images')

    const loadPromises = validImages.map(async ({ asset, metadata }) => {
      try {
        const { width, height, aspectRatio } = await cacheImage(asset.path, asset.id)

        imageStore.addImage({
          id: asset.id,
          url: asset.path,
          name: metadata.name,
          altText: metadata.altText ?? `${metadata.name} altText`,
          type: metadata.type as 'image' | 'logo',
          dimensions: {
            width,
            height,
            naturalWidth: width,
            naturalHeight: height,
            aspectRatio,
          },
        })
        console.log('✅ Image cached:', asset.id, metadata.name, asset.path)
      } catch (error) {
        console.error('❌ Image cache failed:', asset.id, asset.path, error)
      }
    })

    await Promise.all(loadPromises)

    const stats = getCacheStats()
    if (stats.error > 0) {
      console.warn(`⚠️ ImageManager: ${stats.error} images failed to load`)
    }

    isReady.value = true
    suspenseManager.setImagesCached(true)
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

    // Return the cached HTMLImageElement (singleton)
    const cachedElement = imageElementCache.get(imageId)
    if (cachedElement) {
      return cachedElement
    }

    // HMR Safety Net & Fallback
    // If cache is empty but image data exists in Pinia, recreate element from URL
    const imageData = imageStore.getImage(imageId)
    if (imageData) {
      console.warn('⚠️ ImageManager: Cache miss, recreating element for:', imageId)
      const img = new Image()
      img.src = imageData.url
      imageElementCache.set(imageId, img) // Re-cache it
      return img
    }

    // Final fallback if no data exists at all
    console.error('❌ ImageManager: Image not found in cache or store:', imageId)
    return createFallbackImage()
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
  const getImageMetadata = (imageId: string): ImageMetadata | null => {
    const imageData = imageStore.getImage(imageId)

    if (!imageData) {
      return null
    }

    // Ensure type and name are defined with fallbacks
    const type = imageData.type || 'image'
    const name = imageData.name || imageData.id
    const altText = imageData.altText ?? `${name} altText`

    return {
      id: imageData.id,
      type: type as 'image' | 'logo',
      name: name,
      altText: altText,
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
    imageElementCache.clear()
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
    // Normal bulk mode: update layer (respects existing locks)
    // Override handling is done in EditImages.vue before calling this
    canvasData.updateLayer('image', { defaultValue: imageId })
  }

  /**
   * Set current image in focus mode for specific ad unit (internal)
   */
  const setCurrentImageFocusInternal = (adUnitId: string, imageId: string): void => {
    // Check if image is already set for this ad unit
    const currentImageId = getCurrentImageFocusInternal(adUnitId)
    if (currentImageId === imageId) {
      console.log(`ℹ️ Image already set for ${adUnitId}, skipping update to preserve crop data`)
      return
    }

    canvasData.updateElement(adUnitId, 'image', { image: imageId, locked: true })
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
      // Pass imageId to cache the element correctly
      const { width, height, aspectRatio } = await cacheImage(url, imageId)

      // Store in uploadTemp with cached data
      imageStore.setUploadTempImage({
        id: imageId,
        url,
        name,
        altText: '',
        type: 'image',
        dimensions: {
          width,
          height,
          naturalWidth: width,
          naturalHeight: height,
          aspectRatio,
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
    altText: string,
  ): Promise<void> => {
    try {
      const { width, height, aspectRatio } = await cacheImage(path, assetId)

      imageStore.addImage({
        id: assetId,
        url: path,
        type,
        name,
        altText,
        dimensions: {
          width,
          height,
          naturalWidth: width,
          naturalHeight: height,
          aspectRatio,
        },
      })
    } catch (error) {
      console.error('❌ Failed to add uploaded image:', error)
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
   * Update image altText
   */
  const updateImageAltText = (imageId: string, altText: string): void => {
    const imageData = imageStore.getImage(imageId)
    if (imageData) {
      imageStore.addImage({
        ...imageData,
        altText,
      })
    }
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

    // Image metadata updates
    updateImageAltText,

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
