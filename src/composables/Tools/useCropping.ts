// composables/Tools/useCropping.ts

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCroppingStore } from '@/stores/useCroppingStore'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useImageManager } from '@/composables/setupImages/useImageManager'

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export function useCropping() {
  const croppingStore = useCroppingStore()
  const { isCropping, workingCrop } = storeToRefs(croppingStore)
  const { getCurrentAdUnitId, getElement, updateElement } = useCanvasData()
  const { getImage } = useImageManager()

  // Get the current ad unit element being cropped
  const activeElement = computed(() => {
    const adUnitId = getCurrentAdUnitId()
    if (!adUnitId) return null

    const element = getElement(adUnitId, 'image')
    return element?.type === 'image' ? element : null
  })

  // Get original image ID
  const originalImageId = computed(() => {
    return activeElement.value?.image || null
  })

  // Get original image
  const originalImage = computed(() => {
    const imageId = originalImageId.value
    if (!imageId) return null

    const imageData = getImage(imageId)
    return imageData?.image || null
  })

  // Get original image dimensions
  const originalImageDimensions = computed(() => {
    const imageId = originalImageId.value
    if (!imageId) return null

    const imageData = getImage(imageId)
    if (!imageData?.dimensions) return null

    return {
      naturalWidth: imageData.dimensions.naturalWidth,
      naturalHeight: imageData.dimensions.naturalHeight,
    }
  })

  // Get visible area (where the image appears on canvas in focus mode)
  const visibleArea = computed(() => {
    const element = activeElement.value
    if (!element) return null

    return {
      x: element.x,
      y: element.y,
      width: element.width || 0,
      height: element.height || 0,
    }
  })

  // Get aspect ratio of visible area
  const aspectRatio = computed(() => {
    const visible = visibleArea.value
    if (!visible || !visible.width || !visible.height) return 1

    return visible.width / visible.height
  })

  // Get current crop data (working crop during cropping, or element's crop otherwise)
  const cropData = computed(() => {
    if (isCropping.value && workingCrop.value) {
      return workingCrop.value
    }

    // Return element's crop when not actively cropping
    return activeElement.value?.crop || null
  })

  // Calculate scale factors
  const scaleX = computed(() => {
    const visible = visibleArea.value
    const crop = cropData.value
    if (!visible || !crop || !crop.width) return 1

    return visible.width / crop.width
  })

  const scaleY = computed(() => {
    const visible = visibleArea.value
    const crop = cropData.value
    if (!visible || !crop || !crop.height) return 1

    return visible.height / crop.height
  })

  /**
   * Start cropping mode for the image element in the current ad unit
   */
  const startCrop = () => {
    const adUnitId = getCurrentAdUnitId()
    if (!adUnitId) {
      console.warn('Cannot start crop: No active ad unit')
      return
    }

    const element = getElement(adUnitId, 'image')
    if (!element || element.type !== 'image') {
      console.warn('Cannot start crop: Image element not found in current ad unit')
      return
    }

    const imageId = element.image
    if (!imageId) {
      console.warn('Cannot start crop: Element has no image ID')
      return
    }

    const imageData = getImage(imageId)
    if (!imageData?.dimensions) {
      console.warn(`Cannot start crop: Image "${imageId}" not loaded or missing dimensions`)
      return
    }

    // Get initial crop from element
    const initialCrop: CropData = element.crop
      ? {
          x: element.crop.x,
          y: element.crop.y,
          width: element.crop.width || imageData.dimensions.naturalWidth,
          height: element.crop.height || imageData.dimensions.naturalHeight,
        }
      : {
          x: 0,
          y: 0,
          width: imageData.dimensions.naturalWidth,
          height: imageData.dimensions.naturalHeight,
        }

    // Update store state directly
    croppingStore.isCropping = true
    croppingStore.workingCrop = { ...initialCrop }
    croppingStore.originalCrop = { ...initialCrop }

    console.log('🎨 Cropping mode started:', {
      element: 'image',
      originalSize: `${imageData.dimensions.naturalWidth}x${imageData.dimensions.naturalHeight}`,
      visibleSize: `${element.width}x${element.height}`,
      currentCrop: initialCrop,
    })
  }

  /**
   * Constrain crop to valid bounds and aspect ratio
   */
  const constrainCrop = (
    proposedCrop: Partial<CropData>,
    imageDimensions: { naturalWidth: number; naturalHeight: number },
    targetAspectRatio: number,
  ): CropData => {
    const current = workingCrop.value || {
      x: 0,
      y: 0,
      width: imageDimensions.naturalWidth,
      height: imageDimensions.naturalHeight,
    }

    // Start with current values, override with proposed
    const newCrop: CropData = {
      x: proposedCrop.x !== undefined ? proposedCrop.x : current.x,
      y: proposedCrop.y !== undefined ? proposedCrop.y : current.y,
      width: proposedCrop.width !== undefined ? proposedCrop.width : current.width,
      height: proposedCrop.height !== undefined ? proposedCrop.height : current.height,
    }

    // Enforce aspect ratio if only one dimension changed
    if (proposedCrop.width !== undefined && proposedCrop.height === undefined) {
      console.log('🔧 Aspect Ratio: Width-only change, calculating height')
      const oldHeight = newCrop.height
      newCrop.height = newCrop.width / targetAspectRatio
      console.log(`   Height adjusted from ${oldHeight} to ${newCrop.height}`)
    } else if (proposedCrop.height !== undefined && proposedCrop.width === undefined) {
      console.log('🔧 Aspect Ratio: Height-only change, calculating width')
      const oldWidth = newCrop.width
      newCrop.width = newCrop.height * targetAspectRatio
      console.log(`   Width adjusted from ${oldWidth} to ${newCrop.width}`)
    } else if (proposedCrop.width !== undefined && proposedCrop.height !== undefined) {
      // Both dimensions provided, check if aspect ratio matches
      const currentAspect = newCrop.width / newCrop.height
      const diff = Math.abs(currentAspect - targetAspectRatio)

      if (diff > 0.01) {
        console.log('🔧 Aspect Ratio: Both dimensions provided, aspect mismatch detected')
        console.log(
          `   Current aspect: ${currentAspect.toFixed(3)} Target aspect: ${targetAspectRatio.toFixed(3)}`,
        )
        const oldHeight = newCrop.height
        newCrop.height = newCrop.width / targetAspectRatio
        console.log(`   Height adjusted from ${oldHeight} to ${newCrop.height}`)
      }
    }

    // Constrain minimum size
    const minSize = 50
    if (newCrop.width < minSize) {
      console.log(`🔧 Constrain: Width below minimum, clamped from ${newCrop.width} to ${minSize}`)
      newCrop.width = minSize
      newCrop.height = minSize / targetAspectRatio
    }
    if (newCrop.height < minSize) {
      console.log(
        `🔧 Constrain: Height below minimum, clamped from ${newCrop.height} to ${minSize}`,
      )
      newCrop.height = minSize
      newCrop.width = minSize * targetAspectRatio
    }

    // Constrain to image bounds - width/height
    if (newCrop.width > imageDimensions.naturalWidth) {
      console.log(
        `🔧 Constrain: Width exceeds bounds, clamped from ${newCrop.width} to ${imageDimensions.naturalWidth}`,
      )
      newCrop.width = imageDimensions.naturalWidth
      newCrop.height = newCrop.width / targetAspectRatio
    }
    if (newCrop.height > imageDimensions.naturalHeight) {
      console.log(
        `🔧 Constrain: Height exceeds bounds, clamped from ${newCrop.height} to ${imageDimensions.naturalHeight}`,
      )
      newCrop.height = imageDimensions.naturalHeight
      newCrop.width = newCrop.height * targetAspectRatio
    }

    // Constrain position
    const oldX = newCrop.x
    const oldY = newCrop.y
    newCrop.x = Math.max(0, Math.min(newCrop.x, imageDimensions.naturalWidth - newCrop.width))
    newCrop.y = Math.max(0, Math.min(newCrop.y, imageDimensions.naturalHeight - newCrop.height))

    if (newCrop.x !== oldX || newCrop.y !== oldY) {
      console.log(
        `🔧 Constrain: Position clamped from {x: ${oldX}, y: ${oldY}} to {x: ${newCrop.x}, y: ${newCrop.y}}`,
      )
    }

    console.log('✅ Final crop:', newCrop)
    return newCrop
  }

  /**
   * Update crop coordinates (called during drag/resize operations)
   */
  const updateCropArea = (proposedCrop: Partial<CropData>) => {
    const dimensions = originalImageDimensions.value
    const ratio = aspectRatio.value

    if (!dimensions) {
      console.warn('Cannot update crop: Missing image dimensions')
      return
    }

    const constrained = constrainCrop(proposedCrop, dimensions, ratio)

    // Update store directly
    croppingStore.workingCrop = constrained
  }

  /**
   * Apply the crop and exit cropping mode
   */
  const applyCrop = () => {
    const adUnitId = getCurrentAdUnitId()
    const finalCrop = workingCrop.value

    if (!adUnitId || !finalCrop) {
      console.warn('Cannot apply crop: Missing required data')
      return
    }

    // Commit to canvas
    updateElement(adUnitId, 'image', {
      crop: finalCrop,
    })

    console.log('✅ Crop applied:', finalCrop)

    // Reset store state directly
    croppingStore.isCropping = false
    croppingStore.workingCrop = null
    croppingStore.originalCrop = null
  }

  /**
   * Cancel cropping without saving changes
   */
  const cancelCrop = () => {
    console.log('❌ Crop cancelled - discarding changes')

    // Reset store state directly
    croppingStore.isCropping = false
    croppingStore.workingCrop = null
    croppingStore.originalCrop = null
  }

  /**
   * Convert canvas coordinates to image coordinates
   */
  const canvasToImageCoords = (canvasX: number, canvasY: number) => {
    const visible = visibleArea.value
    const crop = cropData.value
    if (!visible || !crop) return { x: 0, y: 0 }

    const relativeX = canvasX - visible.x
    const relativeY = canvasY - visible.y

    return {
      x: crop.x + relativeX / scaleX.value,
      y: crop.y + relativeY / scaleY.value,
    }
  }

  /**
   * Convert image coordinates to canvas coordinates
   */
  const imageToCanvasCoords = (imageX: number, imageY: number) => {
    const visible = visibleArea.value
    const crop = cropData.value
    if (!visible || !crop) return { x: 0, y: 0 }

    return {
      x: visible.x + (imageX - crop.x) * scaleX.value,
      y: visible.y + (imageY - crop.y) * scaleY.value,
    }
  }

  return {
    // State
    isCropping,
    activeElement,
    cropData,
    visibleArea,
    originalImage,
    originalImageId,
    originalImageDimensions,
    aspectRatio,
    scaleX,
    scaleY,

    // Actions
    startCrop,
    updateCropArea,
    applyCrop,
    cancelCrop,
    constrainCrop,
    canvasToImageCoords,
    imageToCanvasCoords,
  }
}
