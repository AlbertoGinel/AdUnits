// composables/setupImages/useImageManager.ts
import { ref } from 'vue'
import { useAppStore } from '@/data/stores/useAppStore'
import { useLayerStore } from '@/data/stores/useLayerStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useImageStore } from '@/data/stores/useImageStore'
import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import type { CreativeBundle } from '@/features/api/useCreativeAPI'
import type { ImageMetadata } from '@/types/creativeTypes'
import type { ImageAsset } from '../../types/mainTypes'

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

export type AddImageParams = {
  assetId: string
  path: string
  type: 'image' | 'logo'
  name: string
  altText: string
}

function createImageManager() {
  // State management
  const isInitialized = ref(false)
  const isReady = ref(false)
  const fallbackImage = ref<HTMLImageElement | null>(null)

  // Cache for the actual, loaded HTMLImageElement objects
  const imageElementCache = new Map<string, HTMLImageElement>()

  // Store integrations
  const appStore = useAppStore()
  const layerStore = useLayerStore()
  const adUnitStore = useAdUnitStore()
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
    validImages: Array<{ asset: CreativeBundle['assets'][0]; metadata: ImageMetadata }>,
  ): Promise<void> => {
    console.log('🚀 ImageManager: Starting bulk cache for', validImages.length, 'images')

    const loadPromises = validImages.map(async ({ asset, metadata }) => {
      try {
        const { width, height, aspectRatio } = await cacheImage(asset.path, asset.id)

        imageStore.addImage({
          imageId: asset.id,
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
    const name = imageData.name || imageData.imageId
    const altText = imageData.altText ?? `${name} altText`

    return {
      imageId: imageData.imageId,
      type: type as 'image' | 'logo',
      name: name,
      altText: altText,
    }
  }

  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    const allImages = Object.values(imageStore.getAllImages())
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
    const layer = layerStore.getLayer('image')
    return layer?.imageID || null
  }

  /**
   * Get current image in focus mode for specific ad unit (internal)
   */
  const getCurrentImageFocusInternal = (adUnitId: string): string | null => {
    const element = adUnitStore.getElement(adUnitId, 'image')
    return element?.id || null
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
    layerStore.updateLayer('image', { imageID: imageId })
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

    adUnitStore.updateElement(adUnitId, 'image', { imageID: imageId, locked: true })
  }

  /**
   * Get current image (context-aware)
   * Automatically detects if we're in bulk or focus mode
   */
  const getCurrentImage = (): string | null => {
    const currentView = appStore.getCurrentView()

    if (currentView === 'bulkMode') {
      return getCurrentImageBulk()
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = appStore.getCurrentAdUnitId()
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
    const currentView = appStore.getCurrentView()

    if (currentView === 'bulkMode') {
      setCurrentImageBulk(imageId)
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = appStore.getCurrentAdUnitId()
      if (!currentAdUnitId) return
      setCurrentImageFocusInternal(currentAdUnitId, imageId)
    }
  }

  /**
   * Get current logo in bulk mode (internal)
   */
  const getCurrentLogoBulk = (): string | null => {
    const layer = layerStore.getLayer('logo')
    return layer?.imageID || null
  }

  /**
   * Get current logo in focus mode for specific ad unit (internal)
   */
  const getCurrentLogoFocusInternal = (adUnitId: string): string | null => {
    const element = adUnitStore.getElement(adUnitId, 'logo')
    return element?.id || null
  }

  /**
   * Set current logo in bulk mode (internal)
   */
  const setCurrentLogoBulk = (logoId: string): void => {
    layerStore.updateLayer('logo', { imageID: logoId })
  }

  /**
   * Set current logo in focus mode for specific ad unit (internal)
   */
  const setCurrentLogoFocusInternal = (adUnitId: string, logoId: string): void => {
    const currentLogoId = getCurrentLogoFocusInternal(adUnitId)

    if (currentLogoId === logoId) {
      console.log(`ℹ️ Logo already set for ${adUnitId}, skipping update`)
      return
    }
    adUnitStore.updateElement(adUnitId, 'logo', { imageID: logoId, locked: true })
  }

  /**
   * Get current logo (context-aware)
   * Automatically detects if we're in bulk or focus mode
   */
  const getCurrentLogo = (): string | null => {
    const currentView = appStore.getCurrentView()

    if (currentView === 'bulkMode') {
      return getCurrentLogoBulk()
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = appStore.getCurrentAdUnitId()
      if (!currentAdUnitId) return null
      return getCurrentLogoFocusInternal(currentAdUnitId)
    }

    return null
  }

  /**
   * Set current logo (context-aware)
   * Automatically detects if we're in bulk or focus mode
   */
  const setCurrentLogo = (logoId: string): void => {
    const currentView = appStore.getCurrentView()

    if (currentView === 'bulkMode') {
      setCurrentLogoBulk(logoId)
    }

    if (currentView === 'focusMode') {
      const currentAdUnitId = appStore.getCurrentAdUnitId()

      if (!currentAdUnitId) return
      setCurrentLogoFocusInternal(currentAdUnitId, logoId)
    }
  }

  /**
   * Cache temporary image for upload preview
   * Only creates blob URL and caches, does NOT add to Pinia store
   */
  const cacheTemporaryImage = async (file: File, type: 'image' | 'logo'): Promise<string> => {
    try {
      // Generate UUID for the image
      const imageId = `${crypto.randomUUID()}`

      // Create object URL for the file
      const url = URL.createObjectURL(file)

      // Get file name without extension for name
      const name = file.name.replace(/\.[^/.]+$/, '')

      // Pass imageId to cache the element correctly
      const { width, height, aspectRatio } = await cacheImage(url, imageId)

      // Preserve existing altText if user was typing
      const existingUploadTemp = imageStore.getUploadTemp()
      const preservedAltText = existingUploadTemp?.altText || ''

      // Store in uploadTemp with complete metadata
      imageStore.setUploadTemp({
        imageId: imageId,
        url,
        name,
        altText: preservedAltText, // ✅ Preserve user's existing altText
        type,
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
      throw error
    }
  }

  /**
   * Add uploaded image to regular images after API success
   * Loads the image and adds to Pinia store
   */

  const addUploadedImage = async (params: AddImageParams): Promise<void> => {
    const { assetId, path, type, name, altText } = params

    try {
      const { width, height, aspectRatio } = await cacheImage(path, assetId)

      const imageAsset: ImageAsset = {
        imageId: assetId,
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
      }

      imageStore.addImage(imageAsset)
    } catch (error) {
      console.error('❌ Failed to add uploaded image:', error)
      throw error
    }
  }

  const getUploadTempImage = () => {
    return imageStore.getUploadTemp()
  }

  /**
   * Check if upload temporary image exists
   */
  const hasUploadTemp = (): boolean => {
    return imageStore.hasUploadTemp()
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
   * Update altText in uploadTemp
   */
  const updateUploadTempAltText = (altText: string): void => {
    const uploadTemp = imageStore.getUploadTemp()
    if (uploadTemp) {
      imageStore.setUploadTemp({
        ...uploadTemp,
        altText,
      })
    }
  }

  /**
   * Clear upload temporary image
   */
  const clearUploadTemp = (): void => {
    imageStore.setUploadTemp(null)
  }

  const removeImage = (imageId: string): void => {
    // Remove from Pinia store
    imageStore.removeImage(imageId)
  }

  /**
   * Check if image ID represents an empty/fallback state
   */
  const isEmptyImage = (imageId: string | null | undefined): boolean => {
    return !imageId || imageId === '' || imageId === '__fallback__'
  }

  /**
   * Check if current image should show fallback
   */
  const shouldShowFallback = (): boolean => {
    const currentImageId = getCurrentImage()
    return isEmptyImage(currentImageId)
  }

  /**
   * Get image dimensions by ID
   * Returns dimensions object if available, null otherwise
   */
  const getDimensionsById = (
    imageId: string,
  ): { naturalWidth: number; naturalHeight: number; aspectRatio: number } | null => {
    if (!imageId || imageId === '' || imageId === '__fallback__') {
      return null
    }

    const imageData = imageStore.getImage(imageId)
    return imageData?.dimensions || null
  }

  return {
    // State
    isInitialized,
    isReady,

    // Core methods
    getImageOptimized,
    cacheTemporaryImage,
    addUploadedImage,
    bulkCacheImages,
    removeImage,

    // Upload temp management
    getUploadTempImage,
    hasUploadTemp,
    clearUploadTemp,

    // Image metadata updates
    updateImageAltText,
    updateUploadTempAltText,

    // Status checks
    isImageReady,
    areAllImagesReady,
    getStatus,

    // Canvas integration
    getCurrentImage,
    setCurrentImage,
    getCurrentLogo,
    setCurrentLogo,
    getImagesByType,

    // Metadata
    getImageMetadata,
    getDimensionsById,

    // Utilities
    getCacheStats,
    clearCache,
    isEmptyImage,
    shouldShowFallback,
  }
}
