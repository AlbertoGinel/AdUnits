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
    name?: string,
    isReserved?: boolean,
  ): Promise<ImageAsset> => {
    // Use name as key if provided, otherwise use id
    const key = name || id

    // ✅ CHECK: If image already loaded, return it immediately
    const existing = isReserved
      ? imageStore.reserved[key as 'fallback' | 'uploadTemp']
      : imageStore.images[key]

    if (existing && existing.loaded && existing.image) {
      console.log(`♻️ Image already loaded: ${key}`)
      return existing
    }

    console.log(`🌐 Loading image from network: ${key}`)

    return new Promise<ImageAsset>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        // ✅ Convert to data URL for better memory caching
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        // Create a data URL (base64) - this stays in memory
        const dataUrl = canvas.toDataURL('image/png')

        // Create a new image with the data URL (don't modify the original)
        const cachedImg = new Image()
        cachedImg.src = dataUrl

        // Store in state (use name as key, id as property)
        const asset: ImageAsset = {
          id: isReserved ? `__reserved__${key}` : id,
          url: dataUrl,
          name,
          type,
          image: cachedImg,
          dimensions: {
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          },
          loaded: true,
        }

        // Store in reserved or regular images
        if (isReserved) {
          imageStore.reserved[key as 'fallback' | 'uploadTemp'] = asset
        } else {
          imageStore.images[key] = asset
        }

        const typeLabel = type ? ` [${type}]` : ''
        console.log(`✅ Loaded: ${key}${typeLabel} (${img.naturalWidth}x${img.naturalHeight})`)
        resolve(asset)
      }

      img.onerror = () => {
        console.error(`❌ Failed to load image: ${key} from ${url}`)
        reject(new Error(`Failed to load: ${url}`))
      }

      img.src = url // ← Load from network ONCE
    })
  }

  /**
   * Initialize reserved images (fallback)
   */
  const initializeReservedImages = async () => {
    console.log('🔧 Initializing reserved images...')

    // Load fallback image
    await loadImage('fallback', '/Fallback.png', 'image', 'fallback', true)

    // Initialize uploadTemp as empty placeholder
    imageStore.reserved.uploadTemp = null

    console.log('✅ Reserved images initialized')
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
    initializeReservedImages,
    getImage,
    getCurrentImage,
    uploadImage,
    getUploadedImages,
    getImagesByType,
    preloadDefaultImages,
  }
}
