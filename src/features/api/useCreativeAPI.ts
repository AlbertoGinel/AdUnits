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
   * Upload -> Add to Pinia -> Export -> UpdateCreative -> Clear/Cleanup
   */
  const insertAsset = async (creativeId: string, file: File): Promise<InsertAssetResult> => {
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

      console.log('🔍 DEBUG: uploadResponse received:', uploadResponse)
      console.log('🔍 DEBUG: uploadResponse.id:', uploadResponse.id)
      console.log('🔍 DEBUG: uploadResponse.assetId:', uploadResponse.assetId)
      console.log('🔍 DEBUG: uploadResponse.path:', uploadResponse.path)
      console.log('🔍 DEBUG: uploadResponse.url:', uploadResponse.url)

      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        suspenseManager.setAssetOperationInProgress(false)
        notifications.showError('Upload Failed', uploadResponse.message || 'Upload failed')
        return { success: false, message: uploadResponse.message || 'Upload failed' }
      }

      uploadedAssetId = uploadResponse.assetId // ✅ Correct field name from InsertAssetResult
      const uploadedUrl = uploadResponse.path // Just use path directly
      console.log('🔍 DEBUG: Extracted values:')
      console.log('  - uploadedAssetId:', uploadedAssetId)
      console.log('  - uploadedUrl:', uploadedUrl)
      console.log('✅ Step 1 complete: Asset uploaded', uploadedAssetId)

      if (!uploadedAssetId || !uploadedUrl) {
        console.log('❌ DEBUG: Missing values!')
        console.log('  - uploadedAssetId exists?', !!uploadedAssetId)
        console.log('  - uploadedUrl exists?', !!uploadedUrl)
        throw new Error(
          `Asset upload succeeded but no id or path returned. Got id: ${uploadedAssetId}, path: ${uploadedUrl}`,
        )
      }

      // Step 2: Move uploaded image to permanent list with real UUID
      console.log('Step 2: Moving temp upload to permanent list with real UUID...')
      imageService.promoteTempToList() // Pass the real UUID to override temp ID
      console.log('✅ Step 2 complete: Image promoted to list with real UUID:', uploadedAssetId)

      // Step 2.5: Cache the uploaded asset with its new UUID before clearing temp
      console.log('Step 2.5: Caching uploaded asset with new UUID...')
      if (imageStore.uploadTemp.url && uploadedAssetId) {
        // Get the image cache service
        const { useImageCache } = await import('@/features/imagesManager/useImageCache')
        const imageCache = useImageCache()

        // Cache the asset with its new UUID using the temp blob URL
        await imageCache.setCacheImage(imageStore.uploadTemp.url, uploadedAssetId)
      }
      console.log('✅ Step 3 complete: Data exported')

      // Step 4: Update creative
      console.log('Step 4: Updating creative...')
      const updateResult = await updateCreative(creativeId)

      if (updateResult.success) {
        // Step 5 Success: Clear uploadTemp (now safe since asset is cached with new UUID)
        console.log('Step 5: Clearing uploadTemp...')
        imageService.clearUploadTemp()
        console.log('✅ Step 5 complete: uploadTemp cleared')

        suspenseManager.setAssetOperationInProgress(false)
        notifications.showSuccess('Asset Uploaded', 'Image uploaded successfully')

        console.log('✅ Asset insertion successful:', uploadedAssetId)
        return {
          success: true,
          message: 'Asset inserted successfully',
          assetId: uploadedAssetId,
        }
      } else {
        // Step 5 Failure: Remove from Pinia
        console.log('Step 5: Removing from Pinia due to updateCreative failure...')
        imageService.removeImage(uploadedAssetId)
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
        imageService.removeImage(uploadedAssetId)
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
