import { ref, computed } from 'vue'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useCanvasData } from '@/composables/data/useCanvasData'

// 🏠 Singleton state - shared across all component instances
const currentScreen = ref<'edit' | 'change' | 'upload'>('edit')
const selectedLibraryImageId = ref<string | null>(null)

export function useEditImagesControl() {
  // 🎯 Core dependencies
  const { startCrop, applyCrop, cancelCrop, isCropping } = useCropping()
  const imageManager = useImageManager()
  const { getCurrentView } = useCanvasData()

  console.log('🔍 useEditImagesControl called, currentScreen:', currentScreen.value)

  // 🎯 Computed state from canvas
  const isFocusMode = computed(() => getCurrentView() === 'focusMode')

  // 🖼️ Image management
  const currentImageId = computed(() => imageManager.getCurrentImage())
  const hasImage = computed(() => !!currentImageId.value)

  const currentImageUrl = computed(() => {
    if (!currentImageId.value) return ''
    const imageElement = imageManager.getImageOptimized(currentImageId.value)
    return imageElement?.src || ''
  })

  // 📚 Available images for library
  const availableImages = computed(() => {
    const imageIds = imageManager.getImagesByType('image')
    return imageIds.map((id) => {
      const metadata = imageManager.getImageMetadata(id)
      const imageElement = imageManager.getImageOptimized(id)
      return {
        id,
        name: metadata?.name || id,
        image: imageElement,
      }
    })
  })

  // 📝 Alt text with two-way binding
  const altText = computed({
    get: () => {
      const currentImageId = imageManager.getCurrentImage()
      if (!currentImageId) return ''
      const metadata = imageManager.getImageMetadata(currentImageId)
      return metadata?.altText || ''
    },
    set: (value: string) => {
      const currentImageId = imageManager.getCurrentImage()
      if (currentImageId) {
        imageManager.updateImageAltText(currentImageId, value)
      }
    },
  })

  // 🔘 Preview buttons based on current screen and state
  const previewButtons = computed(() => {
    const buttons = []

    // Crop button - only in focus mode, not currently cropping
    if (isFocusMode.value && hasImage.value && !isCropping.value) {
      buttons.push({
        id: 'startCrop',
        label: 'Crop',
        action: 'startCrop',
        class: 'btn-crop',
      })
    }

    // Save/Cancel crop buttons - only when cropping
    if (isFocusMode.value && isCropping.value && hasImage.value) {
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
    if (currentScreen.value === 'edit' && hasImage.value) {
      buttons.push({
        id: 'change',
        label: 'Change',
        action: 'changeImage',
        class: 'btn-change',
      })
    }

    if (currentScreen.value === 'change' && hasImage.value) {
      buttons.push({
        id: 'remove',
        label: 'Remove Image',
        action: 'removeImage',
        class: 'btn-remove',
      })
    }

    return buttons
  })

  // 🎬 Button click handler - what happens when user clicks buttons?
  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'startCrop':
        startCrop()
        break

      case 'saveCrop':
        applyCrop()
        break

      case 'cancelCrop':
        cancelCrop()
        break

      case 'changeImage':
        // Navigate to change view

        currentScreen.value = 'change'
        console.log('🚀 Navigating to change view', currentScreen.value)
        break

      case 'removeImage':
        console.log('🗑️ Remove image clicked')
        imageManager.setCurrentImage('')
        break

      default:
        console.warn('Unknown action:', action)
    }
  }

  // 🔄 Navigation handler for Add Image button
  const handleAddImage = () => {
    currentScreen.value = 'upload'
    console.log('🚀 Navigating to upload view', currentScreen.value)
  }

  // 📷 Image selection handler - called from UploadLibrary component
  const handleImageSelected = (imageId: string | null) => {
    selectedLibraryImageId.value = imageId
  }

  // 📥 Insert image handler - called from UploadLibrary in ChangeImages
  const handleInsertRequested = (imageId: string) => {
    console.log('🔄 Insert image clicked with ID:', imageId)
    imageManager.setCurrentImage(imageId)
    selectedLibraryImageId.value = null // Clear selection after use
  }

  return {
    // State
    selectedLibraryImageId,
    currentScreen,

    // Computed
    isFocusMode,
    hasImage,
    availableImages,
    currentImage: currentImageUrl,
    altText,
    previewButtons,

    // Actions
    handleButtonClick,
    handleAddImage,
    handleImageSelected,
    handleInsertRequested,

    // Individual handlers (for direct use if needed)
    startCrop,
    applyCrop,
    cancelCrop,
  }
}
