// composables/useImageManager.ts
import { useImageStore, type ImageAsset, type ImageDimensions } from '@/stores/useImageStore'

// Default fallback image (could be a data URL or simple placeholder)
const DEFAULT_FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K'

export const useImageManager = () => {
  const imageStore = useImageStore()

  // Extract dimensions from loaded image
  const extractDimensions = (img: HTMLImageElement): ImageDimensions => {
    return {
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight,
    }
  }

  // Internal image loading function
  const loadImageInternal = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  // Load a single image with dimensions
  const loadImage = async (
    id: string,
    url: string,
  ): Promise<{
    image: HTMLImageElement
    dimensions: ImageDimensions
  }> => {
    // Check if already loaded
    const existingImage = imageStore.images[id]
    if (existingImage?.loaded && existingImage.image && existingImage.dimensions) {
      return {
        image: existingImage.image,
        dimensions: existingImage.dimensions,
      }
    }

    // Initialize image asset in store
    imageStore.images[id] = {
      id,
      url,
      loaded: false,
    }

    try {
      const img = await loadImageInternal(url)
      const dimensions = extractDimensions(img)

      const asset: ImageAsset = {
        id,
        url,
        image: img,
        dimensions,
        loaded: true,
      }

      imageStore.images[id] = asset
      return { image: img, dimensions }
    } catch (error) {
      const asset: ImageAsset = {
        id,
        url,
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      imageStore.images[id] = asset
      throw error
    }
  }

  // Load image with fallback support
  const loadImageWithFallback = async (
    id: string,
    primaryUrl: string,
    fallbackUrl: string = DEFAULT_FALLBACK_IMAGE,
  ): Promise<{
    image: HTMLImageElement
    dimensions: ImageDimensions
    usedFallback: boolean
  }> => {
    try {
      // Try to load primary image first
      const result = await loadImage(id, primaryUrl)
      return {
        ...result,
        usedFallback: false,
      }
    } catch (error) {
      console.warn(`Primary image failed for "${id}", using fallback:`, error)

      // Update the store to indicate we're trying fallback
      imageStore.images[id] = {
        id,
        url: primaryUrl,
        fallbackUrl,
        loaded: false,
        error: `Primary failed, trying fallback: ${error}`,
      }

      try {
        // Try to load fallback image
        const fallbackImg = await loadImageInternal(fallbackUrl)
        const dimensions = extractDimensions(fallbackImg)

        const asset: ImageAsset = {
          id,
          url: primaryUrl,
          fallbackUrl,
          image: fallbackImg,
          dimensions,
          loaded: true,
          error: `Primary image failed, using fallback`,
        }

        imageStore.images[id] = asset
        return {
          image: fallbackImg,
          dimensions,
          usedFallback: true,
        }
      } catch (fallbackError) {
        const asset: ImageAsset = {
          id,
          url: primaryUrl,
          fallbackUrl,
          loaded: false,
          error: `Both primary and fallback images failed: ${fallbackError}`,
        }

        imageStore.images[id] = asset
        throw new Error(`Failed to load both primary and fallback images for "${id}"`)
      }
    }
  }

  // Preload multiple images with fallback support
  const preloadImages = async (
    images: Array<{
      id: string
      url: string
      fallbackUrl?: string
    }>,
  ): Promise<{ successes: string[]; failures: string[] }> => {
    const results = await Promise.allSettled(
      images.map(({ id, url, fallbackUrl }) =>
        fallbackUrl ? loadImageWithFallback(id, url, fallbackUrl) : loadImage(id, url),
      ),
    )

    const successes: string[] = []
    const failures: string[] = []

    results.forEach((result, index) => {
      const imageConfig = images[index]
      if (!imageConfig) {
        console.error(`Missing image config at index ${index}`)
        return
      }

      const imageId = imageConfig.id
      if (result.status === 'fulfilled') {
        successes.push(imageId)
        imageStore.preloadedImages[imageId] = true
      } else {
        failures.push(imageId)
        console.error(`Failed to preload image "${imageId}":`, result.reason)
      }
    })

    return { successes, failures }
  }

  // Get image with dimensions
  const getImage = (
    id: string,
  ): { image: HTMLImageElement; dimensions: ImageDimensions } | null => {
    const asset = imageStore.images[id]

    if (!asset) {
      // Only log warnings after initialization is complete
      if (imageStore.isInitialized) {
        console.warn(`Image "${id}" not found in store`)
      }
      return null
    }

    if (!asset.loaded || !asset.image || !asset.dimensions) {
      // Only log occasionally during loading to reduce spam
      if (Math.random() < 0.05) {
        // Only log 5% of the time
        console.warn(`Image "${id}" loading...`)
      }
      return null
    }

    return {
      image: asset.image,
      dimensions: asset.dimensions,
    }
  }

  // Get just the dimensions (useful for layout calculations)
  const getDimensions = (id: string): ImageDimensions | null => {
    const asset = imageStore.images[id]
    return asset?.dimensions || null
  }

  // Calculate scaled dimensions while maintaining aspect ratio
  const getScaledDimensions = (
    id: string,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } | null => {
    const dimensions = getDimensions(id)
    if (!dimensions) return null

    const { naturalWidth, naturalHeight, aspectRatio } = dimensions

    let width = naturalWidth
    let height = naturalHeight

    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  // Check if images are preloaded
  const areImagesPreloaded = (ids: string[]): boolean => {
    return ids.every((id) => imageStore.preloadedImages[id])
  }

  // Clear images (useful for cleanup)
  const clearImages = (): void => {
    imageStore.images = {}
    imageStore.preloadedImages = {}
  }

  // Preload default application images
  const preloadDefaultImages = async (): Promise<void> => {
    const defaultImages = [
      {
        id: 'logo',
        url: '/logo.png',
        fallbackUrl: DEFAULT_FALLBACK_IMAGE,
      },
      {
        id: 'lifeStyle',
        url: '/lifeStyle.png',
        fallbackUrl: DEFAULT_FALLBACK_IMAGE,
      },
    ]

    console.log('🖼️ Preloading default images...')

    try {
      const { successes, failures } = await preloadImages(defaultImages)

      if (successes.length > 0) {
        console.log('✅ Successfully preloaded images:', successes)
      }

      if (failures.length > 0) {
        console.warn('⚠️ Failed to preload images:', failures)
      }

      // Mark initialization as complete
      imageStore.isInitialized = true
    } catch (error) {
      console.error('❌ Error preloading default images:', error)
      throw error
    }
  }

  return {
    loadImage,
    loadImageWithFallback,
    preloadImages,
    preloadDefaultImages,
    getImage,
    getDimensions,
    getScaledDimensions,
    areImagesPreloaded,
    clearImages,
    // Expose store getters for reactive access
    isLoaded: imageStore.isLoaded,
    isLoading: imageStore.isLoading,
    hasError: imageStore.hasError,
    getAspectRatio: imageStore.getAspectRatio,
  }
}
