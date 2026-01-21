import { ref, computed } from 'vue'
import { useEditTools } from '@/features/editTools/useEditTools'
import { useFieldService } from '@/data/services/useFieldService'
import { useImageService } from '@/data/services/useImageService'

export function useLibraryAssets() {
  const { selectedTool } = useEditTools()
  const { updateFieldValue } = useFieldService()
  const imageService = useImageService()

  // Selection state
  const selectedLibraryImageId = ref<string>('')

  // Library images for current asset type
  const libraryImages = computed(() => {
    if (selectedTool.value === 'image' || selectedTool.value === 'logo') {
      const images = imageService.getImagesByType(selectedTool.value)
      return images
    }
    return []
  })

  // Transform for LibraryAsset component
  const libraryImagesFormatted = computed(() => {
    return libraryImages.value.map((image) => ({
      imageID: image.imageID,
      name: image.name,
      image: imageService.getImageElement(image.imageID), // HTMLImageElement for thumbnails
      type: image.type,
      altText: image.altText,
    }))
  })

  // Select image from library
  const selectImage = (imageID: string) => {
    console.log('📚 Selecting library image:', imageID)
    selectedLibraryImageId.value = imageID
  }

  // Apply selected image to current element
  const applySelectedImage = (onComplete?: () => void) => {
    if (
      selectedLibraryImageId.value &&
      (selectedTool.value === 'image' || selectedTool.value === 'logo')
    ) {
      console.log('✅ Applying image to element:', selectedLibraryImageId.value)
      updateFieldValue(selectedTool.value, 'imageID', selectedLibraryImageId.value)

      // Clear selection
      selectedLibraryImageId.value = ''

      // Callback for navigation (from useEditAssets)
      onComplete?.()
    }
  }

  // Clear selection
  const clearImageSelection = () => {
    selectedLibraryImageId.value = ''
  }

  return {
    // Library data
    libraryImages,
    libraryImagesFormatted,

    // Selection state
    selectedLibraryImageId,

    // Selection methods
    selectImage,
    applySelectedImage,
    clearImageSelection,
  }
}
