// composables/api/useCreativeAPI.ts
import { useMockAPI } from './useMockAPI'
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
}

export interface CreativeBundle {
  stage?: { width: number; height: number }
  assets: AssetResponse[]
  creativeData: CreativeDataContent
}

export function useCreativeAPI() {
  const api = useMockAPI()

  /**
   * Get assets for a creative
   */
  const getAssets = async (creativeId: string): Promise<AssetResponse[]> => {
    const response = await api.fetchAssets(creativeId)

    // Validate response
    if (!response.content || !Array.isArray(response.content)) {
      throw new Error('Invalid assets response')
    }

    return response.content as AssetResponse[]
  }

  /**
   * Get creative data (adUnits, layers, images)
   */
  const getCreativeData = async (creativeId: string): Promise<CreativeDataContent> => {
    const response = await api.fetchCreativeData(creativeId)

    // Validate response
    if (!response.creativeData?.data) {
      throw new Error('Invalid creative data response')
    }

    return response.creativeData.data as CreativeDataContent
  }

  /**
   * Get complete creative bundle (assets + creative data)
   * Parallel fetch for better performance
   */
  const getCreativeBundle = async (creativeId: string): Promise<CreativeBundle> => {
    console.log('📡 Fetching creative bundle:', creativeId)

    const [assetsResponse, creativeResponse] = await Promise.all([
      api.fetchAssets(creativeId),
      api.fetchCreativeData(creativeId),
    ])

    // Validate and extract data
    if (!assetsResponse.content || !Array.isArray(assetsResponse.content)) {
      throw new Error('Invalid assets response')
    }

    if (!creativeResponse.creativeData?.data) {
      throw new Error('Invalid creative data response')
    }

    const assets = assetsResponse.content as AssetResponse[]
    const creativeData = creativeResponse.creativeData.data as CreativeDataContent

    console.log('✅ Creative bundle loaded:', {
      assets: assets.length,
      adUnits: Object.keys(creativeData.adUnits).length,
      layers: Object.keys(creativeData.layers).length,
      images: creativeData.images.length,
    })

    return {
      assets,
      creativeData,
    }
  }

  /**
   * Upload an asset file
   * @param creativeId - Creative ID to attach asset to
   * @param file - File to upload
   * @returns Upload response with server path
   */
  const uploadAsset = async (creativeId: string, file: File): Promise<UploadAssetResponse> => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit')
    }

    const response = await api.uploadAsset(creativeId, file)

    if (response.status !== 200) {
      throw new Error(response.message || 'Upload failed')
    }

    return response
  }

  return {
    getAssets,
    getCreativeData,
    getCreativeBundle,
    uploadAsset,
  }
}
