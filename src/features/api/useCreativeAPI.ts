// composables/api/useCreativeAPI.ts
import { useMockAPI } from './mockAPI/useMockAPI'
import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import { useNotifications } from '@/features/feedbackAsync/useNotifications'
import { useContentTransformer } from '@/data/services/useHelperContentData'
import { useImageService } from '@/data/services/useImageService'
import { useImageStore } from '@/data/stores/useImageStore'
import type { CreativeContentData } from '@/types/creativeTypes'
import type {
  CreativeBundle,
  AssetResponse,
  UpdateCreativeResult,
  InsertAssetResult,
  DeleteAssetResult,
} from '@/types/APITypes'

/**
 * Switchable Creative API - Dev/Production environment detection
 * Handles all creative operations with transaction-like behavior
 */

// API Response Types

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development'

export function useCreativeAPI() {
  const suspenseManager = useSuspenseManager()
  const notifications = useNotifications()
  const { exportToCreativeContentData } = useContentTransformer()
  const imageService = useImageService()
  const imageStore = useImageStore()
  const { importFromCreativeContentData } = useContentTransformer()

  const getCreativeBundle = async (creativeId: string): Promise<CreativeBundle> => {
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

      //here we have both structures
      const assets = assetsResponse.content as AssetResponse[]
      const creativeData = creativeResponse.creativeData.data as CreativeContentData

      console.log('The assets: ', assets)
      console.log('The creativeData: ', creativeData)

      importFromCreativeContentData(creativeData)

      // ✅ THEN merge URLs from assets into Pinia images
      assets.forEach((asset) => {
        const existingImage = imageStore.getImage(asset.id)
        if (existingImage) {
          const updatedImage = { ...existingImage, url: asset.url || asset.path }
          imageStore.updateImage(updatedImage)
        }
      })

      console.log('✅ Creative bundle loaded using existing services')

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
      const rawData = exportToCreativeContentData()
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

      if (response.status < 200 || response.status >= 300) {
        notifications.showError('Update Failed', response.message || 'Update failed')
        return { success: false, message: response.message || 'Update failed' }
      } else {
        console.log('✅ Creative updated successfully')
        notifications.showSuccess('Saved!', 'Creative updated successfully')
        return { success: true, message: 'Creative updated successfully' }
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
   * Upload -> Promote -> Save -> Flush (or rollback on failure)
   */
  const insertAsset = async (creativeId: string, file: File): Promise<InsertAssetResult> => {
    console.log(`📤 Inserting asset: ${file.name}`)

    suspenseManager.setAssetOperationInProgress(true)

    try {
      // Step 1: Upload and get ID
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

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Upload failed')
      }

      const uploadedAssetId = uploadResponse.assetId
      const uploadedUrl = uploadResponse.path

      if (!uploadedAssetId || !uploadedUrl) {
        throw new Error('Missing asset ID or URL from upload')
      }

      console.log(`✅ Got ID: ${uploadedAssetId}`)

      // Step 2: Promote temp to permanent
      console.log('Step 2: Promoting temp to list...')
      imageService.promoteTempToList(uploadedAssetId, uploadedUrl)

      // Step 3: Try to save creative
      console.log('Step 3: Saving creative...')
      const saveResult = await updateCreative(creativeId)

      if (saveResult.success) {
        // Step 4a: Success - Flush temp
        console.log('✅ Save successful - flushing temp')
        imageService.clearUploadTemp()
        suspenseManager.setAssetOperationInProgress(false)
        return { success: true, message: 'Asset inserted successfully' }
      } else {
        // Step 4b: Save failed - Rollback promotion
        console.log('❌ Save failed - rolling back promotion')
        imageStore.removeImage(uploadedAssetId)
        throw new Error(saveResult.message || 'Save failed')
      }
    } catch (error) {
      console.error('❌ Insert failed:', error)
      suspenseManager.setAssetOperationInProgress(false)
      notifications.showError(
        'Upload Failed',
        error instanceof Error ? error.message : 'Upload failed',
      )
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
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

      originalCreativeData = exportToCreativeContentData()
      if (!originalCreativeData) {
        throw new Error('Cannot export creative data for update')
      }

      // Remove asset from images array
      const updatedData = {
        ...originalCreativeData,
        images: originalCreativeData.images.filter((img) => img.imageID !== assetId),
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

      if (updateResponse.status < 200 || updateResponse.status >= 300) {
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
