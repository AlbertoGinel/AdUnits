// composables/api/useCreativeAPI.ts
import { useMockAPI } from './mockAPI/useMockAPI'
import { useCanvasData } from '@/composables/data/useCanvasData'
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
  const canvasData = useCanvasData()
  const suspenseManager = useSuspenseManager()
  const notifications = useNotifications()

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
      // Get current state from Pinia
      const currentData = canvasData.exportToCreativeContentData()

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
   * Insert asset with transaction-like behavior
   * Step 1: Upload asset -> Step 2: Update creative data
   * Rollback: Delete asset if creative update fails
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
      // Step 1: Upload asset with direct DEV/PROD switching
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

      // Add image to Pinia imageStore with the real assetId
      // This must happen BEFORE Step 2 so exportToCreativeContentData includes it
      const imageManager = await import('@/composables/setupImages/useImageManager').then((m) =>
        m.useImageManager(),
      )
      const imageStore = (await import('@/stores/useImageStore')).useImageStore()
      await imageManager.addUploadedImage(
        uploadedAssetId,
        uploadedPath,
        metadata.type,
        metadata.name,
        metadata.altText,
      )

      // Clear uploadTemp after successfully adding to regular images
      imageStore.setUploadTempImage(null)
      console.log('✅ Image added to Pinia store with assetId:', uploadedAssetId)
      console.log('✅ Cleared uploadTemp')

      // Step 2: Update creative data to include new asset
      console.log('Step 2: Updating creative data...')

      // Export current data (now includes the new image with correct assetId)
      const currentData = canvasData.exportToCreativeContentData()
      if (!currentData) {
        throw new Error('Cannot export creative data for update')
      }

      // Update via API with direct DEV/PROD switching
      const payload = {
        version: 1,
        data: currentData,
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
        // Step 2 failed - rollback Step 1
        console.warn('⚠️ Step 2 failed, rolling back Step 1...')

        try {
          if (uploadedAssetId) {
            const rollbackResponse = await (isDevelopment
              ? useMockAPI().deleteAsset(uploadedAssetId)
              : fetch(`/api/v1/assets/${uploadedAssetId}`, { method: 'DELETE' }).then((r) =>
                  r.json(),
                ))

            if (rollbackResponse.status !== 200) {
              throw new Error(`Rollback failed: ${rollbackResponse.message}`)
            }
          }
          console.log('✅ Rollback successful: Asset deleted')
        } catch (rollbackError) {
          console.error('💥 ROLLBACK FAILED:', rollbackError)
          suspenseManager.setAssetOperationInProgress(false)
          notifications.showError(
            'Critical Error',
            `Update failed AND rollback failed. Asset ${uploadedAssetId} may be orphaned.`,
          )
          return {
            success: false,
            message: `Update failed AND rollback failed. Asset ${uploadedAssetId} may be orphaned.`,
          }
        }

        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Update Failed', updateResponse.message || 'Creative update failed')
        return { success: false, message: updateResponse.message || 'Creative update failed' }
      }

      console.log('✅ Step 2 complete: Creative data updated')
      console.log('✅ Asset insertion successful:', uploadedAssetId)

      suspenseManager.setAssetOperationInProgress(false)
      notifications.showSuccess('Asset Uploaded', 'Image uploaded successfully')

      return {
        success: true,
        message: 'Asset inserted successfully',
        assetId: uploadedAssetId || undefined,
        path: uploadResponse.path,
      }
    } catch (error) {
      console.error('❌ Asset insertion failed:', error)

      // If we uploaded an asset but something else failed, try rollback
      if (uploadedAssetId) {
        console.warn('⚠️ Attempting rollback of uploaded asset...')
        try {
          if (uploadedAssetId) {
            const rollbackResponse = await (isDevelopment
              ? useMockAPI().deleteAsset(uploadedAssetId)
              : fetch(`/api/v1/assets/${uploadedAssetId}`, { method: 'DELETE' }).then((r) =>
                  r.json(),
                ))

            if (rollbackResponse.status !== 200) {
              throw new Error(`Rollback failed: ${rollbackResponse.message}`)
            }
          }
          console.log('✅ Rollback successful')
        } catch (rollbackError) {
          console.error('💥 ROLLBACK FAILED:', rollbackError)
          suspenseManager.setAssetOperationInProgress(false)
          notifications.showError(
            'Critical Error',
            `Insertion failed AND rollback failed. Asset ${uploadedAssetId} may be orphaned.`,
          )
          return {
            success: false,
            message: `Insertion failed AND rollback failed. Asset ${uploadedAssetId} may be orphaned.`,
          }
        }
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
