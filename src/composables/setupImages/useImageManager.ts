// composables/setupImages/useImageManager.ts
import { useImageStore, type ImageAsset } from '@/stores/useImageStore'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useImageDatabase } from '@/composables/database/useImageDatabase'

export const useImageManager = () => {
  const imageStore = useImageStore()
  const { getLayers } = useCanvasData()
  const imageDatabase = useImageDatabase()

  /**
   * Load an image from URL with IndexedDB blob caching
   * Creates HTMLImageElement and stores blob for efficient reuse
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

    console.log(`🌐 Loading image: ${key} from ${url}`)

    // Generate blob ID for storage
    const blobId = `img_${key}`

    try {
      // Check if we have this image in IndexedDB
      const existingBlobUrl = await imageDatabase.getImageBlob(blobId)

      let blobUrl: string
      let img: HTMLImageElement

      if (existingBlobUrl) {
        // Use existing blob
        console.log(`💾 Using cached blob: ${key}`)
        blobUrl = existingBlobUrl
        img = await createImageFromBlobUrl(blobUrl)
      } else {
        // Fetch and store new image
        console.log(`📥 Fetching and caching: ${key}`)

        // Handle different URL types
        if (url.startsWith('data:')) {
          // Convert data URL to blob
          const response = await fetch(url)
          const blob = await response.blob()
          blobUrl = await imageDatabase.storeImageBlob(blobId, blob, url)
        } else if (url.startsWith('blob:')) {
          // Already a blob URL, just use it
          blobUrl = url
        } else {
          // Fetch from network and cache
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          blobUrl = await imageDatabase.storeFromResponse(blobId, response, url)
        }

        img = await createImageFromBlobUrl(blobUrl)
      }

      // Create asset
      const asset: ImageAsset = {
        id: isReserved ? `__reserved__${key}` : id,
        url, // ✅ Keep original URL
        blobUrl, // ✅ Add blob URL for display
        blobId, // ✅ Add IndexedDB key
        name,
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

      // Store in appropriate location
      if (isReserved) {
        imageStore.reserved[key as 'fallback' | 'uploadTemp'] = asset
      } else {
        imageStore.images[key] = asset
      }

      const typeLabel = type ? ` [${type}]` : ''
      console.log(`✅ Loaded: ${key}${typeLabel} (${img.naturalWidth}x${img.naturalHeight})`)
      return asset
    } catch (error) {
      console.error(`❌ Failed to load image: ${key} from ${url}`, error)
      throw new Error(`Failed to load: ${url}`)
    }
  }

  /**
   * Create HTMLImageElement from blob URL
   */
  const createImageFromBlobUrl = (blobUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to create image from blob URL`))

      img.src = blobUrl
    })
  } /**
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
   * Stores in IndexedDB and creates asset with blob URL
   */
  const uploadImage = async (file: File, type: 'image' | 'logo' = 'image'): Promise<ImageAsset> => {
    // Generate unique ID for uploaded image
    const id = `upload-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`
    const blobId = `img_uploadTemp` // ✅ Use fixed ID for uploadTemp

    try {
      // Store file directly in IndexedDB
      const blobUrl = await imageDatabase.storeFromFile(blobId, file, `file://${file.name}`)

      // Create image element from blob URL
      const img = await createImageFromBlobUrl(blobUrl)

      // Create asset
      const asset: ImageAsset = {
        id,
        url: `file://${file.name}`, // ✅ Original file reference
        blobUrl, // ✅ Blob URL for display
        blobId, // ✅ IndexedDB key (img_uploadTemp)
        name: file.name,
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
        isUploaded: true,
      }

      // Don't store in general images store for uploadTemp
      console.log(`📤 Uploaded: ${file.name} → ${blobId} (IndexedDB only)`)

      return asset
    } catch (error) {
      console.error(`❌ Failed to upload image:`, error)
      throw error
    }
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

  /**
   * Clean up image resources (revoke blob URLs, delete from IndexedDB)
   */
  const cleanupImage = async (imageId: string): Promise<void> => {
    // Check both general images and reserved
    const asset = imageStore.images[imageId] || imageStore.reserved.uploadTemp

    if (!asset) {
      console.log(`⚠️ No asset found for cleanup: ${imageId}`)
      return
    }

    try {
      // Revoke blob URL to free memory
      if (asset.blobUrl) {
        URL.revokeObjectURL(asset.blobUrl)
        console.log(`🔄 Revoked blob URL: ${asset.blobUrl}`)
      }

      // Delete from IndexedDB
      if (asset.blobId) {
        await imageDatabase.deleteImageBlob(asset.blobId)
        console.log(`🗑️ Deleted from IndexedDB: ${asset.blobId}`)
      }

      // Remove from appropriate store
      if (imageStore.images[imageId]) {
        delete imageStore.images[imageId]
      }
      if (imageStore.reserved.uploadTemp?.id === imageId) {
        imageStore.reserved.uploadTemp = null
      }

      console.log(`🧹 Cleaned up image: ${imageId}`)
    } catch (error) {
      console.error(`❌ Failed to cleanup image: ${imageId}`, error)
    }
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
    cleanupImage,
    createImageFromBlobUrl,
  }
}
