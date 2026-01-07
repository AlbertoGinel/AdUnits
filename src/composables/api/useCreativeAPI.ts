// composables/api/useCreativeAPI.ts
import { useMockAPI } from './mockAPI/useMockAPI'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import type { AddImageParams } from '@/composables/setupImages/useImageManager'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import { useNotifications } from '@/composables/feedbackAsync/useNotifications'
import type { CreativeContentData } from '@/types/creative'

/**
 * Switchable Creative API - Dev/Production environment detection
 * Handles all creative operations with transaction-like behavior
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

// Environment detection
const isDevelopment = import.meta.env.DEV

export function useCreativeAPI() {
  console.log('🔍 Environment Debug:')
  console.log('MODE:', import.meta.env.MODE)
  console.log('DEV:', import.meta.env.DEV)
  console.log('PROD:', import.meta.env.PROD)
  console.log('NODE_ENV:', import.meta.env.NODE_ENV)

  console.log('🎯 Using development mode:', isDevelopment)

  const canvasData = useCanvasData()
  const suspenseManager = useSuspenseManager()
  const notifications = useNotifications()
  const imageManager = useImageManager()

  const getCreativeBundle = async (creativeId: string): Promise<CreativeBundle> => {
    console.log(`📡 [${isDevelopment ? 'DEV' : 'PROD'}] Fetching creative bundle:`, creativeId)

    try {
      // Fetch both endpoints with direct DEV/PROD switching
      const [assetsResponse, creativeResponse] = await Promise.all([
        isDevelopment
          ? useMockAPI().fetchAssets(creativeId)
          : fetch(`/api/v1/assets/creative/${creativeId}`).then((r) => r.json()),
        isDevelopment
          ? useMockAPI().fetchCreativeData(creativeId)
          : fetch(`/api/v1/creative_data/${creativeId}`).then((r) => r.json()),
      ])

      // Check for individual endpoint failures
      if (assetsResponse.status !== 200) {
        const error = new Error(`Assets endpoint failed: ${assetsResponse.status}`)
        throw error
      }

      if (creativeResponse.status !== 200) {
        const error = new Error(`Creative data endpoint failed: ${creativeResponse.status}`)
        throw error
      }

      const assets = assetsResponse.content as AssetResponse[]
      const creativeData = creativeResponse.creativeData.data as CreativeContentData

      console.log('✅ Creative bundle loaded:', {
        assets: assets.length,
        adUnits: Object.keys(creativeData.adUnits || {}).length,
        layers: Object.keys(creativeData.layers || {}).length,
        images: (creativeData.images || []).length,
      })

      // Note: bundleReady is set by useAppInitializer after all steps complete
      notifications.showSuccess('Bundle Loaded', 'Creative loaded successfully')

      return {
        assets,
        creativeData,
      }
    } catch (error) {
      console.error('❌ Failed to fetch creative bundle:', error)

      notifications.showError(
        'Failed to Load Data',
        error instanceof Error ? error.message : 'Unknown error',
        [
          {
            label: 'Retry',
            action: () => window.location.reload(),
          },
        ],
      )

      throw error
    }
  }

  /**
   * Update creative data (PUT)
   */
  const updateCreative = async (creativeId: string): Promise<UpdateCreativeResult> => {
    console.log(`📤 [${isDevelopment ? 'DEV' : 'PROD'}] Updating creative:`, creativeId)

    suspenseManager.setUpdateCreativeInProgress(true)

    try {
      // Get current state from Pinia and convert to plain object
      const rawData = canvasData.exportToCreativeContentData()
      const currentData = JSON.parse(JSON.stringify(rawData))

      console.log('Current data is here: ', currentData)

      if (!currentData) {
        suspenseManager.setUpdateCreativeInProgress(false)
        return { success: false, message: 'No creative data to export' }
      }

      // Call API with direct DEV/PROD switching
      const payload = {
        version: 1,
        data: currentData,
        creative_id: creativeId,
      }
      const response = isDevelopment
        ? await useMockAPI().updateCreative(creativeId, payload)
        : await fetch(`/api/v1/creative_data/${creativeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((r) => r.json())

      suspenseManager.setUpdateCreativeInProgress(false)

      if (response.status === 200) {
        console.log('✅ Creative updated successfully')
        notifications.showSuccess('Saved!', 'Creative updated successfully')
        return { success: true, message: 'Creative updated successfully' }
      } else {
        notifications.showError('Update Failed', response.message || 'Update failed')
        return { success: false, message: response.message || 'Update failed' }
      }
    } catch (error) {
      console.error('❌ Failed to update creative:', error)

      suspenseManager.setUpdateCreativeInProgress(false)
      notifications.showError(
        'Update Failed',
        error instanceof Error ? error.message : 'Update failed',
      )

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Update failed',
      }
    }
  }

  /**
   * Insert asset with simplified approach
   * Upload -> Add to Pinia -> Export -> UpdateCreative -> Clear/Cleanup
   */
  const insertAsset = async (
    creativeId: string,
    file: File,
    metadata: { type: 'image' | 'logo'; name: string; altText: string },
  ): Promise<InsertAssetResult> => {
    console.log(`📤 [${isDevelopment ? 'DEV' : 'PROD'}] Inserting asset:`, file.name)

    suspenseManager.setAssetOperationInProgress(true)

    let uploadedAssetId: string | null = null

    try {
      // Step 1: Upload asset
      console.log('Step 1: Uploading asset...')
      const uploadResponse = isDevelopment
        ? await useMockAPI().insertAsset(creativeId, file)
        : await (async () => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('creative_id', creativeId)
            return fetch(`/api/v1/assets/${creativeId}`, {
              method: 'POST',
              body: formData,
            }).then((r) => r.json())
          })()

      if (uploadResponse.status !== 200) {
        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Upload Failed', uploadResponse.message || 'Upload failed')
        return { success: false, message: uploadResponse.message || 'Upload failed' }
      }

      uploadedAssetId = uploadResponse.assetId
      const uploadedPath = uploadResponse.path
      console.log('✅ Step 1 complete: Asset uploaded', uploadedAssetId)

      if (!uploadedAssetId || !uploadedPath) {
        throw new Error('Asset upload succeeded but no assetId or path returned')
      }

      // Step 2: Add image to Pinia with AddImageParams
      console.log('Step 2: Adding to Pinia...')
      const imageParams: AddImageParams = {
        assetId: uploadedAssetId,
        path: uploadedPath,
        type: metadata.type,
        name: metadata.name,
        altText: metadata.altText,
      }
      await imageManager.addUploadedImage(imageParams)
      console.log('✅ Step 2 complete: Image added to Pinia store')

      // Step 3: Export current data
      console.log('Step 3: Exporting current data...')
      const rawData = canvasData.exportToCreativeContentData()
      const currentData = JSON.parse(JSON.stringify(rawData))
      if (!currentData) {
        throw new Error('Cannot export creative data for update')
      }
      console.log('✅ Step 3 complete: Data exported')

      // Step 4: Update creative
      console.log('Step 4: Updating creative...')
      const updateResult = await updateCreative(creativeId)

      if (updateResult.success) {
        // Step 5 Success: Clear uploadTemp
        console.log('Step 5: Clearing uploadTemp...')
        imageManager.clearUploadTemp()
        console.log('✅ Step 5 complete: uploadTemp cleared')

        suspenseManager.setAssetOperationInProgress(false)
        notifications.showSuccess('Asset Uploaded', 'Image uploaded successfully')

        console.log('✅ Asset insertion successful:', uploadedAssetId)
        return {
          success: true,
          message: 'Asset inserted successfully',
          assetId: uploadedAssetId,
          path: uploadedPath,
        }
      } else {
        // Step 5 Failure: Remove from Pinia
        console.log('Step 5: Removing from Pinia due to updateCreative failure...')
        imageManager.removeImage(uploadedAssetId)
        console.log('✅ Step 5 complete: Image removed from Pinia')

        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Update Failed', updateResult.message)
        return { success: false, message: updateResult.message }
      }
    } catch (error) {
      console.error('❌ Asset insertion failed:', error)

      // If we added to Pinia, remove it
      if (uploadedAssetId) {
        console.log('Removing failed upload from Pinia...')
        imageManager.removeImage(uploadedAssetId)
      }

      suspenseManager.setAssetOperationInProgress(false)
      notifications.showError(
        'Asset Upload Failed',
        error instanceof Error ? error.message : 'Asset insertion failed',
      )

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Asset insertion failed',
      }
    }
  }

  /**
   * Delete asset with transaction-like behavior
   * Step 1: Update creative data -> Step 2: Delete asset
   */
  const deleteAsset = async (creativeId: string, assetId: string): Promise<DeleteAssetResult> => {
    console.log(`🗑️ [${isDevelopment ? 'DEV' : 'PROD'}] Deleting asset:`, assetId)

    suspenseManager.setAssetOperationInProgress(true)

    let originalCreativeData: CreativeContentData | null = null

    try {
      // Step 1: Update creative data to remove asset
      console.log('Step 1: Updating creative data...')

      originalCreativeData = canvasData.exportToCreativeContentData()
      if (!originalCreativeData) {
        throw new Error('Cannot export creative data for update')
      }

      // Remove asset from images array
      const updatedData = {
        ...originalCreativeData,
        images: originalCreativeData.images.filter((img) => img.id !== assetId),
      }

      const payload = {
        version: 1,
        data: updatedData,
        creative_id: creativeId,
      }
      const updateResponse = isDevelopment
        ? await useMockAPI().updateCreative(creativeId, payload)
        : await fetch(`/api/v1/creative_data/${creativeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((r) => r.json())

      if (updateResponse.status !== 200) {
        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Update Failed', updateResponse.message || 'Creative update failed')
        return { success: false, message: updateResponse.message || 'Creative update failed' }
      }

      console.log('✅ Step 1 complete: Creative data updated')

      // Step 2: Delete asset with direct DEV/PROD switching
      console.log('Step 2: Deleting asset...')
      const deleteResponse = isDevelopment
        ? await useMockAPI().deleteAsset(assetId)
        : await fetch(`/api/v1/assets/${assetId}`, { method: 'DELETE' }).then((r) => r.json())

      if (deleteResponse.status !== 200) {
        // Step 2 failed - rollback Step 1
        console.warn('⚠️ Step 2 failed, rolling back Step 1...')

        try {
          const rollbackPayload = {
            version: 1,
            data: originalCreativeData,
            creative_id: creativeId,
          }
          const rollbackResponse = await (isDevelopment
            ? useMockAPI().updateCreative(creativeId, rollbackPayload)
            : fetch(`/api/v1/creative_data/${creativeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rollbackPayload),
              }).then((r) => r.json()))

          if (rollbackResponse.status !== 200) {
            throw new Error(`Rollback failed: ${rollbackResponse.message}`)
          }
          console.log('✅ Rollback successful: Creative data restored')
        } catch (rollbackError) {
          console.error('💥 ROLLBACK FAILED:', rollbackError)
          suspenseManager.setAssetOperationInProgress(false)
          notifications.showError(
            'Critical Error',
            `Delete failed AND rollback failed. Creative data may be inconsistent.`,
          )
          return {
            success: false,
            message: `Delete failed AND rollback failed. Creative data may be inconsistent.`,
          }
        }

        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Delete Failed', deleteResponse.message || 'Asset deletion failed')
        return { success: false, message: deleteResponse.message || 'Asset deletion failed' }
      }

      console.log('✅ Step 2 complete: Asset deleted')
      console.log('✅ Asset deletion successful:', assetId)

      suspenseManager.setAssetOperationInProgress(false)
      notifications.showSuccess('Asset Deleted', 'Image deleted successfully')

      return { success: true, message: 'Asset deleted successfully' }
    } catch (error) {
      console.error('❌ Asset deletion failed:', error)

      // If we updated creative data but something else failed, try rollback
      if (originalCreativeData) {
        console.warn('⚠️ Attempting rollback of creative data...')
        try {
          const rollbackPayload = {
            version: 1,
            data: originalCreativeData,
            creative_id: creativeId,
          }
          const rollbackResponse = await (isDevelopment
            ? useMockAPI().updateCreative(creativeId, rollbackPayload)
            : fetch(`/api/v1/creative_data/${creativeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rollbackPayload),
              }).then((r) => r.json()))

          if (rollbackResponse.status !== 200) {
            throw new Error(`Rollback failed: ${rollbackResponse.message}`)
          }
          console.log('✅ Rollback successful')
        } catch (rollbackError) {
          console.error('💥 ROLLBACK FAILED:', rollbackError)
          suspenseManager.setAssetOperationInProgress(false)
          notifications.showError(
            'Critical Error',
            `Deletion failed AND rollback failed. Creative data may be inconsistent.`,
          )
          return {
            success: false,
            message: `Deletion failed AND rollback failed. Creative data may be inconsistent.`,
          }
        }
      }

      suspenseManager.setAssetOperationInProgress(false)
      notifications.showError(
        'Asset Delete Failed',
        error instanceof Error ? error.message : 'Asset deletion failed',
      )

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Asset deletion failed',
      }
    }
  }

  return {
    // Core operations
    getCreativeBundle,
    updateCreative,
    insertAsset,
    deleteAsset,

    // Utility
    isDevelopment,
  }
}
