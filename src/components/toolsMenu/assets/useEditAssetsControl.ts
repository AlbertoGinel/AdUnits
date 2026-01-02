import { ref, computed } from 'vue'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useElements } from '@/composables/data/useElements'
import { useTools } from '@/composables/Tools/useTools'

const ASSET_DISPLAY = {
  image: { singular: 'image', plural: 'Images' },
  logo: { singular: 'logo', plural: 'Logos' },
} as const

// 🏠 Singleton state - shared across all component instances
const currentAssetScreen = ref<'edit' | 'change' | 'upload'>('edit')
const selectedLibraryAssetId = ref<string | null>(null)

export function useEditAssetsControl() {
  // 🎯 Core dependencies
  const { startCrop, applyCrop, cancelCrop, isCropping } = useCropping()
  const imageManager = useImageManager()
  const { getCurrentView, getCurrentAdUnitId, getElementsByTag } = useCanvasData()
  const { getAllLayers, updateLayer } = useLayers()
  const { updateElement } = useElements()
  const tools = useTools()

  const assetType = computed(() => {
    return tools.selectedTool.value === 'logos' ? 'logo' : 'image'
  })

  const assetDisplayText = computed(() => ASSET_DISPLAY[assetType.value])

  const isLogoMode = computed(() => assetType.value === 'logo')

  console.log('🔍 useEditAssetsControl called, currentAssetScreen:', currentAssetScreen.value)

  // 🎯 Computed state from canvas
  const isFocusMode = computed(() => getCurrentView() === 'focusMode')

  // 🖼️ Asset management (generic for images/logos based on current tag)
  const currentTag = computed(() => (isLogoMode.value ? 'logo' : 'image'))

  const currentAssetId = computed(() => {
    const tag = currentTag.value
    const currentView = getCurrentView()
    const currentAdUnitId = getCurrentAdUnitId()

    if (currentView === 'focusMode' && currentAdUnitId) {
      // Focus mode: get from current ad unit element
      const elements = getElementsByTag(currentAdUnitId, tag)
      return elements[0]?.text || elements[0]?.image || ''
    } else {
      // Bulk mode: get from layer value
      const layers = getAllLayers()
      return layers[tag]?.defaultValue || ''
    }
  })

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

  // 📝 Alt text with two-way binding (for both images and logos)
  const altText = computed({
    get: () => {
      const assetId = currentAssetId.value
      if (!assetId) return ''
      const metadata = imageManager.getImageMetadata(assetId)
      return metadata?.altText || ''
    },
    set: (value: string) => {
      const assetId = currentAssetId.value
      if (assetId) {
        imageManager.updateImageAltText(assetId, value)
      }
    },
  })

  // 🔘 Button sets - clearly defined for each state
  const buttonSets = {
    // When cropping is active (images only)
    cropping: [
      {
        id: 'saveCrop',
        label: 'Save Crop',
        action: 'saveCrop',
        class: 'btn-preview',
      },
      {
        id: 'cancelCrop',
        label: 'Cancel',
        action: 'cancelCrop',
        class: 'btn-preview',
      },
    ],

    // Edit screen buttons
    edit: (isLogo: boolean) => [
      // Crop button only for images in focus mode
      ...(!isLogo && isFocusMode.value && !isCropping.value
        ? [
            {
              id: 'startCrop',
              label: 'Crop',
              action: 'startCrop',
              class: 'btn-crop',
            },
          ]
        : []),
      // Change button always available when asset exists
      {
        id: 'change',
        label: 'Change',
        action: 'changeAsset',
        class: 'btn-preview',
      },
    ],

    // Change screen buttons
    change: (isLogo: boolean) => [
      {
        id: 'remove',
        label: isLogo ? 'Remove Logo' : 'Remove Image',
        action: 'removeAsset',
        class: 'btn-preview',
        icon: 'cross',
      },
    ],

    // No asset state
    empty: [],
  }

  // 🔘 Preview buttons based on current state
  const previewButtons = computed(() => {
    if (!hasAsset.value) return buttonSets.empty

    // Priority 1: If cropping, only show cropping buttons
    if (isFocusMode.value && isCropping.value && !isLogoMode.value) {
      return buttonSets.cropping
    }

    // Priority 2: Screen-based button sets
    switch (currentAssetScreen.value) {
      case 'edit':
        return buttonSets.edit(isLogoMode.value)

      case 'change':
        return buttonSets.change(isLogoMode.value)

      default:
        return buttonSets.empty
    }
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
        currentAssetScreen.value = 'change'
        console.log('🚀 Navigating to change view', currentAssetScreen.value)
        break

      case 'removeAsset':
        const assetTypeLabel = isLogoMode.value ? 'logo' : 'image'
        console.log(`🗑️ Remove ${assetTypeLabel} clicked`)

        if (isLogoMode.value) {
          imageManager.setCurrentLogo('')
        } else {
          imageManager.setCurrentImage('')
        }
        break

      default:
        console.warn('Unknown action:', action)
    }
  }

  // 🔄 Navigation handler for Add Asset button
  const handleAddAsset = () => {
    currentAssetScreen.value = 'upload'
    console.log('🚀 Navigating to upload view', currentAssetScreen.value)
  }

  // 📷 Asset selection handler - called from UploadLibrary component
  const handleAssetSelected = (assetId: string | null) => {
    selectedLibraryAssetId.value = assetId
  }

  // 📥 Insert asset handler - called from UploadLibrary in ChangeAssets
  const handleInsertRequested = (assetId: string) => {
    const assetTypeLabel = isLogoMode.value ? 'logo' : 'image'
    console.log(`🔄 Insert ${assetTypeLabel} clicked with ID:`, assetId)

    // Use the correct field model based on asset type
    if (isLogoMode.value) {
      // Update logo through tools logo field model (create if needed)
      const tag = currentTag.value
      const currentView = getCurrentView()
      const currentAdUnitId = getCurrentAdUnitId()

      if (currentView === 'focusMode' && currentAdUnitId) {
        updateElement(currentAdUnitId, tag, { image: assetId })
      } else {
        updateLayer(tag, { defaultValue: assetId })
      }
    } else {
      // Use existing image manager for images
      imageManager.setCurrentImage(assetId)
    }

    selectedLibraryAssetId.value = null // Clear selection after use
  }

  return {
    // State
    selectedLibraryAssetId,
    currentAssetScreen,
    assetType,
    isLogoMode,

    // Computed
    isFocusMode,
    hasAsset,
    availableAssets,
    currentAsset: currentAssetUrl,
    currentAssetId, // Add this for SmartImage
    altText,
    assetDisplayText,
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
