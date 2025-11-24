// composables/setupImages/useImageManager.ts
import { useImageStore, type ImageAsset } from '@/stores/useImageStore'
import { useCanvasData } from '@/composables/data/useCanvasData'

export const useImageManager = () => {
  const imageStore = useImageStore()
  const { getLayers } = useCanvasData()

  /**
   * Load an image from URL (server or local for dev)
   * Creates HTMLImageElement in browser memory
   */
  const loadImage = async (
    id: string,
    url: string,
    type?: 'image' | 'logo',
  ): Promise<ImageAsset> => {
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
      type,
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
    const typeLabel = type ? ` [${type}]` : ''
    console.log(`✅ Loaded: ${id}${typeLabel} (${img.naturalWidth}x${img.naturalHeight})`)
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
  const getImage = (id: string | null | undefined): ImageAsset | null => {
    // If no ID or not found, return fallback
    if (!id) return imageStore.images['fallback'] || null

    const asset = imageStore.images[id]
    if (asset?.image) return asset

    // Not found, return fallback
    return imageStore.images['fallback'] || null
  }

  /**
   * Upload image from user's computer
   * Creates object URL and loads it
   */
  const uploadImage = async (file: File, type: 'image' | 'logo' = 'image'): Promise<ImageAsset> => {
    // Generate unique ID for uploaded image
    const id = `upload-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`

    // Create object URL from file
    const url = URL.createObjectURL(file)

    // Load the image using existing loadImage function
    const asset = await loadImage(id, url, type)

    // Update store entry with additional metadata (triggers reactivity)
    imageStore.images[id] = {
      ...asset,
      name: file.name,
      isUploaded: true,
      type,
    }

    return imageStore.images[id]!
  }

  /**
   * Get all uploaded images
   */
  const getUploadedImages = (): ImageAsset[] => {
    return Object.values(imageStore.images).filter((asset) => asset.isUploaded && asset.image)
  }

  /**
   * Get all images filtered by type (image or logo)
   */
  const getImagesByType = (type: 'image' | 'logo'): ImageAsset[] => {
    return Object.values(imageStore.images).filter((asset) => asset.type === type && asset.image)
  }

  /**
   * Get the current image from layers definition with fallback
   */
  const getCurrentImage = (): ImageAsset | null => {
    const layers = getLayers()
    const imageLayer = layers['image']
    const imageId = imageLayer?.defaultValue || null

    // getImage handles fallback if imageId is null or not found
    return getImage(imageId)
  }

  return {
    loadImage,
    getImage,
    getCurrentImage,
    uploadImage,
    getUploadedImages,
    getImagesByType,
    preloadDefaultImages,
  }
}
