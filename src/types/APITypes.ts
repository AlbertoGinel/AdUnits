import type { CreativeContentData } from '@/types/creativeTypes'

export interface AssetResponse {
  id: string
  type: string
  creative_id: string
  path: string
  url: string
  error: string
}

export interface CreativeBundle {
  assets: AssetResponse[]
  creativeData: CreativeContentData
}

export interface InsertAssetResult {
  success: boolean
  message: string
  assetId?: string
  path?: string
}

export interface UpdateCreativeResult {
  success: boolean
  message: string
}

export interface DeleteAssetResult {
  success: boolean
  message: string
}
