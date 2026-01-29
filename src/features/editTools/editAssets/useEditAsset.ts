import { ref, computed, watch } from 'vue'
import { useEditTools } from '@/features/editTools/useEditTools'
import { useFieldService } from '@/data/services/useFieldService'
import { useImageStore } from '@/data/stores/useImageStore'
import { useImageService } from '@/data/services/useImageService'
import { useAppStore } from '@/data/stores/useAppStore'
import { useLibraryAssets } from './useLibraryAssets'
import { useCreativeAPI } from '@/features/api/useCreativeAPI'
import { useCropState } from '@/features/crop/composables/useCropState'

type AssetSubView = 'main' | 'change' | 'upload'
type ContentState = 'image-preview' | 'preview-placeholder' | 'drag-photos-here'

interface ActionButton {
  id: string
  label: string
  action: string
  class?: string
  disabled?: boolean
}

// Singleton instance
let sharedEditAssetsInstance: ReturnType<typeof createEditAssets> | null = null

export function useEditAssets() {
  if (!sharedEditAssetsInstance) {
    sharedEditAssetsInstance = createEditAssets()
  }
  return sharedEditAssetsInstance
}

function createEditAssets() {
  const editTools = useEditTools()
  const { selectedTool } = editTools
  const { getFieldValue, updateFieldValue } = useFieldService()
  const imageStore = useImageStore()
  const imageService = useImageService()
  const appStore = useAppStore()
  const creativeAPI = useCreativeAPI()
  const cropState = useCropState()

  const activeSubView = ref<AssetSubView>('main')

  // Watch for clearing uploadTemp on view/tool changes
  watch(
    activeSubView,
    (newView, oldView) => {
      // Cancel crop when changing sub-views (main → upload → change)
      if (isCropMode.value) {
        console.log('📋 Auto-canceling crop: sub-view changed')
        cropState.exitCrop()
        isCropMode.value = false
      }

      if (oldView === 'upload' && newView !== 'upload') {
        imageStore.clearUploadTemp()
      }
    },
    {
      immediate: false,
      flush: 'sync',
    },
  )

  watch(
    selectedTool,
    (newTool, oldTool) => {
      // Cancel crop when changing tools (Images → Logos → Text → Extras, etc.)
      if (isCropMode.value && newTool !== oldTool) {
        console.log('🎯 Auto-canceling crop: main tool changed to', newTool)
        cropState.exitCrop()
        isCropMode.value = false
      }

      imageStore.clearUploadTemp()
      activeSubView.value = 'main'
    },
    {
      immediate: false,
      flush: 'sync',
    },
  )

  // Watch for app-level navigation changes
  watch(
    () => appStore.getCurrentView(),
    (newView) => {
      // Cancel crop when leaving focus mode (focus → bulk → other views)
      if (isCropMode.value && newView !== 'focusMode') {
        console.log('🌍 Auto-canceling crop: left focus mode')
        cropState.exitCrop()
        isCropMode.value = false
      }
    },
    {
      immediate: false,
      flush: 'sync',
    },
  )

  // Image state tracking
  const isCropMode = ref(false) // Override state
  const isFocusMode = computed(() => appStore.getCurrentView() === 'focusMode')

  // Upload temp state (computed once, used everywhere)
  const hasUploadTemp = computed(() => imageStore.hasUploadTemp())

  // Drag & Drop state
  const isDragOver = ref(false)
  const isFileProcessing = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)

  // File storage (original File object for upload)
  const currentFile = ref<File | null>(null)

  // Helper computeds
  const currentAssetId = computed(() => {
    if (selectedTool.value !== 'image' && selectedTool.value !== 'logo') return ''

    // Otherwise use field service (saved image)
    const assetId = getFieldValue(selectedTool.value, 'imageID') || ''
    return assetId
  })

  //If there is id Id show it
  const loadedImage = computed(() => {
    // In upload mode, prioritize temp upload
    if (activeSubView.value === 'upload' && hasUploadTemp.value) {
      const tempUpload = imageStore.getUploadTemp()
      const tempImage = new Image()
      tempImage.src = tempUpload.url
      return tempImage
    }

    // For saved images, use imageService
    if (!currentAssetId.value) return null
    const result = imageService.getImageElement(currentAssetId.value)
    return result
  })

  // Simple content state - what UI state to show
  const contentState = computed<ContentState>(() => {
    if (activeSubView.value === 'upload') {
      // Upload mode + has temp → Show temp image preview
      // Upload mode + no temp → Show drag area
      return hasUploadTemp.value ? 'image-preview' : 'drag-photos-here'
    }

    // Main/change mode + has saved image → Show saved image
    // Main/change mode + no saved image → Show placeholder
    return loadedImage.value ? 'image-preview' : 'preview-placeholder'
  })

  // Asset management based on selectedTool
  const currentAssetType = computed(() => {
    return selectedTool.value // 'image' or 'logo'
  })

  const assets = ref([])

  // Focus mode logic
  const hasAsset = ref(true) // TODO: Connect to actual asset existence check

  // Alt text management (context-aware)
  const altText = computed({
    get() {
      // In upload mode, ALWAYS use temp upload (regardless of hasUploadTemp)
      if (activeSubView.value === 'upload') {
        const tempUpload = imageStore.getUploadTemp()
        return tempUpload.altText || ''
      }
      // Otherwise get from saved image metadata
      if (!currentAssetId.value) {
        return ''
      }
      const imageMetadata = imageService.getImageMetadata(currentAssetId.value)
      return imageMetadata?.altText || ''
    },
    set(value: string) {
      // In upload mode, ALWAYS update temp upload (regardless of hasUploadTemp)
      if (activeSubView.value === 'upload') {
        imageStore.updateUploadTempAltText(value)
        return
      }
      // Otherwise update saved image metadata
      if (!currentAssetId.value) {
        return
      }
      imageStore.updateImageAltText(currentAssetId.value, value)
    },
  })

  // Is logo mode helper
  const isLogoMode = computed(() => {
    return currentAssetType.value === 'logo'
  })

  // Helper computeds for buttons
  const hasCurrentImage = computed(() => !!currentAssetId.value)
  const hasImageToCrop = computed(() => !!currentAssetId.value) // Only crop saved images

  // Tree/Additive Button System
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
        return hasUploadTemp.value
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
    if (!isFocusMode.value) return baseButtons // ✅ No focus mode = no crop
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

  // Button state management
  const isButtonDisabled = ref(false)
  const isButtonLoading = ref(false)

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

  const handleRemoveAsset = () => {
    // Only update field value for asset-related tools
    if (selectedTool.value === 'image' || selectedTool.value === 'logo') {
      updateFieldValue(selectedTool.value, 'imageID', '')
    }
  }

  const handleRemoveTemporalImage = () => {
    // Clear the temporal upload from image store
    imageStore.clearUploadTemp()
  }

  // Integrate library composable
  const libraryAssets = useLibraryAssets()

  // Navigation-aware apply function
  const handleApplySelectedImage = () => {
    libraryAssets.applySelectedImage(() => {
      activeSubView.value = 'main' // Navigate back after applying
    })
  }

  const handleFileSelection = async (file: File) => {
    if (!selectedTool.value || (selectedTool.value !== 'image' && selectedTool.value !== 'logo')) {
      console.error('❌ Invalid tool for file upload')
      return
    }

    try {
      isFileProcessing.value = true
      console.log('📁 Processing file:', file.name)

      // Store the original File object for upload
      currentFile.value = file

      // TODO: Add file validation
      // - File type checking (image/*)
      // - Size limits (10MB)
      // - Dimension validation (5000x5000px)

      // Cache as temporary image using imageService (creates blob URL for preview)
      await imageService.setTemporaryImage(file, selectedTool.value)

      console.log('✅ File cached successfully')

      // File is now available via imageStore.uploadTemp (for preview)
      // Original file stored in currentFile.value (for upload)
    } catch (error) {
      console.error('❌ File processing failed:', error)
      // TODO: Show error notification
    } finally {
      isFileProcessing.value = false
    }
  }

  // Update alt text (context-aware)
  const updateAltText = (value: string) => {
    altText.value = value // Uses the computed setter logic above
  }

  const handleUploadAsset = async () => {
    try {
      if (!hasUploadTemp.value || !currentFile.value) {
        console.error('❌ No temp upload or file to process')
        return
      }

      const creativeId = appStore.getCreativeId()
      if (!creativeId) {
        console.error('❌ No creative ID available')
        return
      }

      console.log('🚀 Starting asset upload...')

      // Use the original File object for API upload
      const result = await creativeAPI.insertAsset(creativeId, currentFile.value)

      if (result.success) {
        console.log('✅ Asset uploaded successfully!')

        // Clear file reference after successful upload
        currentFile.value = null

        // Navigate back to main view
        activeSubView.value = 'main'
      } else {
        console.error('❌ Upload failed:', result.message)
      }
    } catch (error) {
      console.error('❌ Upload failed:', error)
    }
  }

  // Crop handlers
  const handleStartCrop = () => {
    console.log('🌾 Starting crop mode')
    isCropMode.value = true
    cropState.enterCrop()
  }

  const handleSaveCrop = () => {
    console.log('💾 Saving crop')
    isCropMode.value = false
    cropState.exitCrop()
    // TODO: Apply actual crop data
  }

  const handleCancelCrop = () => {
    console.log('❌ Cancelling crop')
    isCropMode.value = false
    cropState.exitCrop()
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
    handleRemoveAsset,
    handleRemoveTemporalImage,

    // Other actions
    updateAltText,

    // File processing (for drag & drop component)
    isDragOver,
    isFileProcessing,
    fileInput,
    handleFileSelection,

    // Upload functionality
    currentFile,
    handleUploadAsset,

    // Crop functionality
    handleStartCrop,
    handleSaveCrop,
    handleCancelCrop,

    // Library (from composable)
    ...libraryAssets,
    handleApplySelectedImage,

    // Upload temp state (for components)
    hasUploadTemp,
  }
}
