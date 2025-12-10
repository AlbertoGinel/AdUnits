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
  const imageManager = useImageManager()

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

    // Check if image is actually ready (not fallback)
    if (!imageManager.isImageReady(imageId)) {
      return null
    }

    return imageManager.getImageOptimized(imageId)
  })

  // Get original image dimensions
  const originalImageDimensions = computed(() => {
    const imageId = originalImageId.value
    if (!imageId) return null

    // Check if image is actually ready (not fallback)
    if (!imageManager.isImageReady(imageId)) {
      return null
    }

    const image = imageManager.getImageOptimized(imageId)
    return {
      naturalWidth: image.naturalWidth || 0,
      naturalHeight: image.naturalHeight || 0,
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
   * Calculate cover crop for an image to fill visible area with no holes
   * Uses "cover" strategy - fills entire area, may crop edges
   */
  const calculateCoverCrop = (
    imageId: string,
    visibleWidth: number,
    visibleHeight: number,
  ): CropData | null => {
    // Check if image is actually ready (not fallback)
    if (!imageManager.isImageReady(imageId)) {
      console.warn(`Cannot calculate crop: Image "${imageId}" not found or not loaded`)
      return null
    }

    const image = imageManager.getImageOptimized(imageId)
    const imageWidth = image.naturalWidth
    const imageHeight = image.naturalHeight
    const targetAspect = visibleWidth / visibleHeight
    const imageAspect = imageWidth / imageHeight

    let cropWidth: number
    let cropHeight: number
    let cropX: number
    let cropY: number

    if (imageAspect > targetAspect) {
      // Image is wider than target - crop sides
      cropHeight = imageHeight
      cropWidth = imageHeight * targetAspect
      cropX = (imageWidth - cropWidth) / 2
      cropY = 0
    } else {
      // Image is taller than target - crop top/bottom
      cropWidth = imageWidth
      cropHeight = imageWidth / targetAspect
      cropX = 0
      cropY = (imageHeight - cropHeight) / 2
    }

    const crop: CropData = {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    }

    console.log('🎯 Cover crop calculated:', {
      image: `${imageWidth}x${imageHeight}`,
      visible: `${visibleWidth}x${visibleHeight}`,
      crop,
    })

    return crop
  }

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

    // Check if image is actually ready (not fallback)
    if (!imageManager.isImageReady(imageId)) {
      console.warn(`Cannot start crop: Image "${imageId}" not loaded or missing dimensions`)
      return
    }

    const image = imageManager.getImageOptimized(imageId)

    // Get initial crop from element
    const initialCrop: CropData = element.crop
      ? {
          x: element.crop.x,
          y: element.crop.y,
          width: element.crop.width || image.naturalWidth,
          height: element.crop.height || image.naturalHeight,
        }
      : {
          x: 0,
          y: 0,
          width: image.naturalWidth,
          height: image.naturalHeight,
        }

    // Update store state directly
    croppingStore.isCropping = true
    croppingStore.workingCrop = { ...initialCrop }
    croppingStore.originalCrop = { ...initialCrop }

    console.log('🎨 Cropping mode started:', {
      element: 'image',
      originalSize: `${image.naturalWidth}x${image.naturalHeight}`,
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
    calculateCoverCrop,
    constrainCrop,
    canvasToImageCoords,
    imageToCanvasCoords,
  }
}
