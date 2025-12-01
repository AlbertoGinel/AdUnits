// composables/api/useCreativeAPI.ts
import { useMockAPI } from './useMockAPI'
import { useErrorHandler } from '@/composables/errors/useErrorHandler'
import { useImageStore } from '@/stores/useImageStore'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import type { LayerDefinition } from '@/stores/canvas'

/**
 * Creative API - Business logic layer for API data access
 * Handles types, validation, and data transformation
 */

// API Response Types
export interface AssetResponse {
  id: string
  type: string
  creative_id?: string
  path: string
  error: string
}

export interface ImageMetadata {
  id: string
  type: string
  name: string
}

export interface CreativeDataContent {
  adUnits: Record<string, { elements: Record<string, Record<string, unknown>> }>
  layers: Record<string, LayerDefinition>
  images: ImageMetadata[]
}

export interface UploadAssetResponse {
  status: number
  message: string
  path: string
  assetId: string
}

export interface InsertAssetResponse {
  status: number
  message: string
  assetId: string
  path: string
}

export interface InsertAssetResult {
  success: boolean
  message: string
  assetId?: string
  path?: string
}

export interface CreativeBundle {
  stage?: { width: number; height: number }
  assets: AssetResponse[]
  creativeData: CreativeDataContent
}

export function useCreativeAPI() {
  const api = useMockAPI()
  const errorHandler = useErrorHandler()
  const imageStore = useImageStore()
  const { loadImage, cleanupImage } = useImageManager()

  /**
   * Get assets for a creative with error handling
   */
  const getAssets = async (creativeId: string): Promise<AssetResponse[]> => {
    const retryFn = async () => {
      await getAssets(creativeId)
    }

    try {
      const response = await api.fetchAssets(creativeId)

      if (response.status !== 200) {
        errorHandler.handleNetworkError('load assets', retryFn)
        return []
      }

      return response.content as AssetResponse[]
    } catch {
      errorHandler.handleNetworkError('load assets', retryFn)
      return []
    }
  }

  /**
   * Get creative data with error handling and fallback
   */
  const getCreativeData = async (creativeId: string): Promise<CreativeDataContent | null> => {
    const retryFn = async () => {
      await getCreativeData(creativeId)
    }

    try {
      const response = await api.fetchCreativeData(creativeId)

      if (response.status !== 200) {
        errorHandler.handleCreativeLoadError(new Error('Failed to fetch creative data'), retryFn)
        return null
      }

      return response.creativeData.data as CreativeDataContent
    } catch (error) {
      errorHandler.handleCreativeLoadError(error, retryFn)
      return null
    }
  }

  /**
   * Get complete creative bundle (assets + creative data)
   * Uses error-aware methods for proper error handling and toasts
   */
  const getCreativeBundle = async (creativeId: string): Promise<CreativeBundle> => {
    console.log('📡 Fetching creative bundle:', creativeId)

    // Use error-aware methods that show toasts and handle errors
    const [assets, creativeData] = await Promise.all([
      getAssets(creativeId), // ✅ Has error handling + toasts
      getCreativeData(creativeId), // ✅ Has error handling + toasts
    ])

    // If creativeData failed, we might be in fallback mode
    if (!creativeData) {
      console.log('⚠️ Using fallback creative data due to API error')
      // Return minimal bundle with available assets
      return {
        assets,
        creativeData: {
          adUnits: {},
          layers: {},
          images: [],
        },
      }
    }

    console.log('✅ Creative bundle loaded:', {
      assets: assets.length,
      adUnits: Object.keys(creativeData.adUnits || {}).length,
      layers: Object.keys(creativeData.layers || {}).length,
      images: (creativeData.images || []).length,
    })

    return {
      assets,
      creativeData,
    }
  }

  /**
   * Insert asset with smart error handling and business logic
   * @param creativeId - Creative ID to attach asset to
   * @param file - File to upload
   * @returns Smart result with success/error handling
   */
  const insertAsset = async (creativeId: string, file: File): Promise<InsertAssetResult> => {
    const retryFn = async () => {
      await insertAsset(creativeId, file)
    }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Please select an image file',
        }
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          message: 'File size exceeds 10MB limit',
        }
      }

      console.log('📤 Inserting asset:', file.name)

      // Call mock API (can simulate errors with MOCK_CONFIG)
      const response = await api.insertAsset(creativeId, file)

      if (response.status === 200) {
        console.log('✅ Asset inserted successfully:', response.assetId)

        // SUCCESS FLOW:
        // 1. Delete temporal uploadTemp image
        if (imageStore.reserved.uploadTemp) {
          console.log('🗑️ Cleaning up temp asset')
          await cleanupImage('uploadTemp')
          imageStore.reserved.uploadTemp = null
        }

        // 2. Refresh all images from DB to get fresh data
        console.log('🔄 Refreshing images from database...')
        const assets = await getAssets(creativeId)

        // Load the images that aren't already loaded
        for (const asset of assets) {
          if (!imageStore.images[asset.id]) {
            try {
              console.log('🌐 Loading new image:', asset.id)
              await loadImage(asset.id, asset.path, asset.type as 'image' | 'logo')
            } catch (loadError) {
              errorHandler.handleAssetLoadError(asset.id, loadError, async () => {
                await loadImage(asset.id, asset.path, asset.type as 'image' | 'logo')
              })
            }
          }
        }

        console.log('✅ Images refreshed successfully')

        // Show success toast
        errorHandler.handleUploadSuccess(file.name)

        return {
          success: true,
          message: 'Image uploaded successfully',
          assetId: response.assetId,
          path: response.path,
        }
      } else {
        // ERROR FLOW: Keep temp asset, show error
        errorHandler.handleUploadError(file.name, new Error(response.message), retryFn)

        return {
          success: false,
          message: response.message || 'Upload failed, try later',
        }
      }
    } catch (error) {
      // EXCEPTION FLOW: Keep temp asset, show error
      errorHandler.handleUploadError(file.name, error, retryFn)

      return {
        success: false,
        message: 'Upload failed, try later',
      }
    }
  }

  return {
    getAssets,
    getCreativeData,
    getCreativeBundle,
    insertAsset,

    // Expose error handler for components that need it
    errorHandler,
  }
}
