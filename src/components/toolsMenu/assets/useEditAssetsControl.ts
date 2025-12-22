import { ref, computed } from 'vue'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useTools } from '@/composables/Tools/useTools'

// 🏠 Singleton state - shared across all component instances
const currentScreen = ref<'edit' | 'change' | 'upload'>('edit')
const selectedLibraryAssetId = ref<string | null>(null)

export function useEditAssetsControl() {
  // 🎯 Core dependencies
  const { startCrop, applyCrop, cancelCrop, isCropping } = useCropping()
  const imageManager = useImageManager()
  const { getCurrentView } = useCanvasData()
  const tools = useTools()

  // Determine asset type based on selected tool
  const assetType = computed(() => {
    const result = tools.selectedTool.value === 'logos' ? 'logo' : 'image'
    console.log(
      '🎯 useEditAssetsControl - selectedTool:',
      tools.selectedTool.value,
      'assetType:',
      result,
    )
    return result
  })
  const isLogoMode = computed(() => assetType.value === 'logo')

  console.log('🔍 useEditAssetsControl called, currentScreen:', currentScreen.value)

  // 🎯 Computed state from canvas
  const isFocusMode = computed(() => getCurrentView() === 'focusMode')

  // 🖼️ Asset management (generic for images/logos)
  const currentAssetId = computed(() => imageManager.getCurrentImage())
  const hasAsset = computed(() => !!currentAssetId.value)

  const currentAssetUrl = computed(() => {
    if (!currentAssetId.value) return ''
    const assetElement = imageManager.getImageOptimized(currentAssetId.value)
    return assetElement?.src || ''
  })

  // 📚 Available assets for library
  const availableAssets = computed(() => {
    const assetIds = imageManager.getImagesByType(assetType.value)
    return assetIds.map((id) => {
      const metadata = imageManager.getImageMetadata(id)
      const assetElement = imageManager.getImageOptimized(id)
      return {
        id,
        name: metadata?.name || id,
        image: assetElement, // Keep as 'image' for compatibility
      }
    })
  })

  // 📝 Alt text with two-way binding (only for images, not logos)
  const altText = computed({
    get: () => {
      if (isLogoMode.value) return '' // Logos don't have alt text
      const currentAssetId = imageManager.getCurrentImage()
      if (!currentAssetId) return ''
      const metadata = imageManager.getImageMetadata(currentAssetId)
      return metadata?.altText || ''
    },
    set: (value: string) => {
      if (isLogoMode.value) return // Logos don't have alt text
      const currentAssetId = imageManager.getCurrentImage()
      if (currentAssetId) {
        imageManager.updateImageAltText(currentAssetId, value)
      }
    },
  })

  // 🔘 Preview buttons based on current screen and state
  const previewButtons = computed(() => {
    const buttons = []

    // Crop button - only in focus mode, not currently cropping, and NOT for logos
    if (isFocusMode.value && hasAsset.value && !isCropping.value && !isLogoMode.value) {
      buttons.push({
        id: 'startCrop',
        label: 'Crop',
        action: 'startCrop',
        class: 'btn-crop',
      })
    }

    // Save/Cancel crop buttons - only when cropping (not for logos)
    if (isFocusMode.value && isCropping.value && hasAsset.value && !isLogoMode.value) {
      buttons.push(
        {
          id: 'saveCrop',
          label: 'Save Crop',
          action: 'saveCrop',
          class: 'btn-save',
        },
        {
          id: 'cancelCrop',
          label: 'Cancel',
          action: 'cancelCrop',
          class: 'btn-cancel',
        },
      )
    }

    // Screen-specific buttons
    if (currentScreen.value === 'edit' && hasAsset.value) {
      buttons.push({
        id: 'change',
        label: 'Change',
        action: 'changeAsset',
        class: 'btn-change',
      })
    }

    if (currentScreen.value === 'change' && hasAsset.value) {
      const removeLabel = isLogoMode.value ? 'Remove Logo' : 'Remove Image'
      buttons.push({
        id: 'remove',
        label: removeLabel,
        action: 'removeAsset',
        class: 'btn-remove',
      })
    }

    return buttons
  })

  // 🎬 Button click handler - what happens when user clicks buttons?
  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'startCrop':
        if (!isLogoMode.value) startCrop() // Only allow cropping for images
        break

      case 'saveCrop':
        if (!isLogoMode.value) applyCrop()
        break

      case 'cancelCrop':
        if (!isLogoMode.value) cancelCrop()
        break

      case 'changeAsset':
        // Navigate to change view
        currentScreen.value = 'change'
        console.log('🚀 Navigating to change view', currentScreen.value)
        break

      case 'removeAsset':
        const assetTypeLabel = isLogoMode.value ? 'logo' : 'image'
        console.log(`🗑️ Remove ${assetTypeLabel} clicked`)
        imageManager.setCurrentImage('')
        break

      default:
        console.warn('Unknown action:', action)
    }
  }

  // 🔄 Navigation handler for Add Asset button
  const handleAddAsset = () => {
    currentScreen.value = 'upload'
    console.log('🚀 Navigating to upload view', currentScreen.value)
  }

  // 📷 Asset selection handler - called from UploadLibrary component
  const handleAssetSelected = (assetId: string | null) => {
    selectedLibraryAssetId.value = assetId
  }

  // 📥 Insert asset handler - called from UploadLibrary in ChangeAssets
  const handleInsertRequested = (assetId: string) => {
    const assetTypeLabel = isLogoMode.value ? 'logo' : 'image'
    console.log(`🔄 Insert ${assetTypeLabel} clicked with ID:`, assetId)
    imageManager.setCurrentImage(assetId)
    selectedLibraryAssetId.value = null // Clear selection after use
  }

  return {
    // State
    selectedLibraryAssetId,
    currentScreen,
    assetType,
    isLogoMode,

    // Computed
    isFocusMode,
    hasAsset,
    availableAssets,
    currentAsset: currentAssetUrl,
    currentAssetId, // Add this for SmartImage
    altText,
    previewButtons,

    // Actions
    handleButtonClick,
    handleAddAsset,
    handleAssetSelected,
    handleInsertRequested,

    // Individual handlers (for direct use if needed)
    startCrop,
    applyCrop,
    cancelCrop,
  }
}
