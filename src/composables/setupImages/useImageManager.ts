// composables/setupImages/useImageManager.ts
import { useImageStore, type ImageAsset } from '@/stores/useImageStore'

export const useImageManager = () => {
  const imageStore = useImageStore()

  /**
   * Load an image from URL (server or local for dev)
   * Creates HTMLImageElement in browser memory
   */
  const loadImage = async (id: string, url: string): Promise<ImageAsset> => {
    // Return if already loaded
    const existing = imageStore.images[id]
    if (existing?.image) return existing

    // Create HTMLImageElement
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load: ${url}`))
      img.src = url
    })

    // Store in state
    const asset: ImageAsset = {
      id,
      url,
      image: img,
      dimensions: {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      },
      loaded: true,
    }

    imageStore.images[id] = asset
    console.log(`✅ Loaded: ${id} (${img.naturalWidth}x${img.naturalHeight})`)
    return asset
  }

  /**
   * Preload default images for dev
   */
  const preloadDefaultImages = async () => {
    if (imageStore.isInitialized) return

    const defaultImages = [
      { id: 'lifeStyle', url: '/lifeStyle.png' },
      { id: 'logo', url: '/logo.png' },
      { id: 'fallback', url: '/Fallback.png' },
    ]

    await Promise.all(
      defaultImages.map(({ id, url }) => loadImage(id, url).catch((err) => console.error(err))),
    )

    imageStore.isInitialized = true
    console.log('✅ Default images preloaded')
  }

  /**
   * Get loaded image by ID with fallback support
   */
  const getImage = (id: string): ImageAsset | null => {
    const asset = imageStore.images[id]
    if (asset?.image) return asset

    // Return fallback image if requested image not found
    const fallback = imageStore.images['fallback']
    return fallback?.image ? fallback : null
  }

  /**
   * Upload image from user's computer
   * Creates object URL and loads it
   */
  const uploadImage = async (file: File): Promise<ImageAsset> => {
    // Generate unique ID for uploaded image
    const id = `upload-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`

    // Create object URL from file
    const url = URL.createObjectURL(file)

    // Load the image using existing loadImage function
    const asset = await loadImage(id, url)

    // Store additional metadata
    asset.name = file.name
    asset.isUploaded = true

    return asset
  }

  /**
   * Get all uploaded images
   */
  const getUploadedImages = (): ImageAsset[] => {
    return Object.values(imageStore.images).filter((asset) => asset.isUploaded && asset.image)
  }

  return {
    loadImage,
    getImage,
    uploadImage,
    getUploadedImages,
    preloadDefaultImages,
  }
}
