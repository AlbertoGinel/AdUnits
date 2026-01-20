import { ref, computed } from 'vue'
import { useEditTools } from '@/features/editTools/useEditTools'
import { useFieldService } from '@/data/services/useFieldService'
import { useImageStore } from '@/data/stores/useImageStore'
import { useImageService } from '@/data/services/useImageService'

type AssetSubView = 'main' | 'change' | 'upload'
type ContentState = 'image-preview' | 'preview-placeholder' | 'drag-photos-here'

interface ActionButton {
  id: string
  label: string
  action: string
  class?: string
  disabled?: boolean
}

export function useEditAssets() {
  const { selectedTool } = useEditTools()
  const { getFieldValue, updateFieldValue } = useFieldService()
  const imageStore = useImageStore()
  const imageService = useImageService()

  const activeSubView = ref<AssetSubView>('main')

  // Image state tracking
  const isCropMode = ref(false) // Override state
  const isFocusMode = ref(true) // Add crop capability

  // Helper computeds
  const currentAssetId = computed(() => {
    // Only get field value for asset-related tools
    if (selectedTool.value === 'image' || selectedTool.value === 'logo') {
      const assetId = getFieldValue(selectedTool.value, 'imageID') || ''
      return assetId
    }
    return ''
  })

  const loadedImage = computed(() => {
    if (!currentAssetId.value) return null
    console.log('🖼️ Getting image element for:', currentAssetId.value)
    const result = imageService.getImageElement(currentAssetId.value)
    console.log('🖼️ getImageElement result:', result)
    return result
  })

  // Simple content state - what UI state to show
  const contentState = computed<ContentState>(() => {
    if (activeSubView.value === 'upload' && !imageStore.hasUploadTemp()) {
      return 'drag-photos-here' // Upload mode with no temporal image
    }

    // Check if we have a real image loaded
    if (loadedImage.value) {
      return 'image-preview' // We have a real image to show
    }

    return 'preview-placeholder' // No real image available
  })

  // Navigation methods
  const goToMainEdit = () => {
    activeSubView.value = 'main'
  }

  const goToChangeAsset = () => {
    activeSubView.value = 'change'
  }

  const goToUploadAsset = () => {
    activeSubView.value = 'upload'
  }

  // Asset management based on selectedTool
  const currentAssetType = computed(() => {
    return selectedTool.value // 'image' or 'logo'
  })

  const assets = ref([])

  // Focus mode logic
  const hasAsset = ref(true) // TODO: Connect to actual asset existence check

  // Alt text management (connected to Pinia)
  const altText = computed(() => {
    if (!currentAssetId.value) return ''

    const imageMetadata = imageService.getImageMetadata(currentAssetId.value)
    return imageMetadata?.altText || ''
  })

  // Is logo mode helper
  const isLogoMode = computed(() => {
    return currentAssetType.value === 'logo'
  })

  // Tree/Additive Button System - COMMENTED OUT FOR TESTING
  /*
  const getBaseButtonSet = (): ActionButton[] => {
    switch (activeSubView.value) {
      case 'main':
        return [
          { id: 'change', label: 'Change', action: 'handleChangeAsset', class: 'btn-preview' },
        ]

      case 'change':
        return hasCurrentImage.value
          ? [{ id: 'remove', label: 'Remove', action: 'handleRemoveAsset', class: 'btn-preview' }]
          : []

      case 'upload':
        return imageStore.hasUploadTemp
          ? [
              {
                id: 'remove',
                label: 'Remove',
                action: 'handleRemoveTemporalImage',
                class: 'btn-preview',
              },
            ]
          : []

      default:
        return []
    }
  }

  const addFocusModeButtons = (baseButtons: ActionButton[]): ActionButton[] => {
    if (!isFocusMode.value) return baseButtons

    // In focus mode, ADD crop button if we have an image to crop
    if (hasImageToCrop.value && activeSubView.value === 'main') {
      return [
        ...baseButtons,
        { id: 'crop', label: 'Crop', action: 'handleStartCrop', class: 'btn-preview' },
      ]
    }

    return baseButtons
  }

  const currentButtons = computed<ActionButton[]>(() => {
    // Crop mode completely overrides everything
    if (isCropMode.value) {
      return [
        { id: 'save', label: 'Save', action: 'handleSaveCrop', class: 'btn-preview' },
        { id: 'cancel', label: 'Cancel', action: 'handleCancelCrop', class: 'btn-preview' },
      ]
    }

    // Build buttons step by step
    const baseButtons = getBaseButtonSet()
    const buttonsWithFocus = addFocusModeButtons(baseButtons)

    return buttonsWithFocus
  })
  */

  // Simple empty buttons for testing
  const currentButtons = computed<ActionButton[]>(() => {
    return [] // No buttons for testing
  })

  // Button state management
  const isButtonDisabled = ref(false)
  const isButtonLoading = ref(false)

  // Action methods for buttons to call directly
  const handleChangeAsset = () => {
    goToChangeAsset()
    console.log('Change asset action triggered')
  }

  const handleUploadAsset = () => {
    goToUploadAsset()
    console.log('Upload asset action triggered')
  }

  const handleRemoveAsset = () => {
    // Only update field value for asset-related tools
    if (selectedTool.value === 'image' || selectedTool.value === 'logo') {
      updateFieldValue(selectedTool.value, 'imageID', '')
      console.log('Remove asset action triggered')
    }
  }

  const handleRemoveTemporalImage = () => {
    // Clear the temporal upload from image store
    imageStore.clearUploadTemp()
    console.log('Remove temporal image action triggered')
  }

  const handleStartCrop = () => {
    isCropMode.value = true
    console.log('Start crop action triggered')
  }

  const handleSaveCrop = () => {
    isCropMode.value = false
    console.log('Save crop action triggered')
  }

  const handleCancelCrop = () => {
    isCropMode.value = false
    console.log('Cancel crop action triggered')
  }

  // Load assets based on current tool
  const loadAssets = () => {
    // This will load different assets based on selectedTool.value
    console.log(`Loading assets for: ${currentAssetType.value}`)
  }

  // Update alt text (connects to Pinia)
  const updateAltText = (value: string) => {
    if (!currentAssetId.value) return

    imageService.updateImageAltText(currentAssetId.value, value)
    console.log('Alt text updated in imageService:', value)
  }

  return {
    // State
    activeSubView,
    currentAssetType,
    assets,
    contentState,
    currentButtons,

    // Image state
    loadedImage,
    isCropMode,
    isFocusMode,

    // Focus mode
    hasAsset,

    // Asset data
    altText,
    isLogoMode,

    // Button states
    isButtonDisabled,
    isButtonLoading,

    // Navigation
    goToMainEdit,
    goToChangeAsset,
    goToUploadAsset,

    // Direct actions for buttons
    handleChangeAsset,
    handleUploadAsset,
    handleRemoveAsset,
    handleRemoveTemporalImage,
    handleStartCrop,
    handleSaveCrop,
    handleCancelCrop,

    // Other actions
    loadAssets,
    updateAltText,
  }
}
