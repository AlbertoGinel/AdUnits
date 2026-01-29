import { ref, computed } from 'vue'
import type { CropData } from './useCropMode'
import { useCropConstraints } from './useCropConstraints'
import type { CropConstraints } from './useCropConstraints'

export interface ImageTransform {
  x: number
  y: number
  scale: number
}

export interface DragState {
  isDragging: boolean
  isResizing: boolean
  startPos: { x: number; y: number }
  startTransform: ImageTransform
  startCrop: CropData
  resizeHandle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w'
}

/**
 * Handle crop transform operations (drag, resize, scale)
 */
export function useCropTransform() {
  const constraints = useCropConstraints()

  // Transform state
  const imageTransform = ref<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
  })

  // Drag state
  const dragState = ref<DragState>({
    isDragging: false,
    isResizing: false,
    startPos: { x: 0, y: 0 },
    startTransform: { x: 0, y: 0, scale: 1 },
    startCrop: { x: 0, y: 0, width: 0, height: 0 },
  })

  const isDragging = computed(() => dragState.value.isDragging)
  const isResizing = computed(() => dragState.value.isResizing)

  /**
   * Initialize transform for crop mode
   */
  const initializeTransform = (
    imageDimensions: { width: number; height: number },
    cropData: CropData,
    frameSize: { width: number; height: number },
    stageSize: { width: number; height: number },
  ): void => {
    const scale = constraints.calculateImageScale(imageDimensions, frameSize, cropData, stageSize)
    const position = constraints.calculateImagePosition(imageDimensions, cropData, scale, stageSize)

    imageTransform.value = {
      x: position.x,
      y: position.y,
      scale,
    }
  }

  /**
   * Start dragging the image
   */
  const startDrag = (stageX: number, stageY: number, currentCrop: CropData): void => {
    dragState.value = {
      isDragging: true,
      isResizing: false,
      startPos: { x: stageX, y: stageY },
      startTransform: { ...imageTransform.value },
      startCrop: { ...currentCrop },
    }
  }

  /**
   * Start resizing from a handle
   */
  const startResize = (
    stageX: number,
    stageY: number,
    handle: DragState['resizeHandle'],
    currentCrop: CropData,
  ): void => {
    dragState.value = {
      isDragging: false,
      isResizing: true,
      startPos: { x: stageX, y: stageY },
      startTransform: { ...imageTransform.value },
      startCrop: { ...currentCrop },
      resizeHandle: handle,
    }
  }

  /**
   * Update drag position
   */
  const updateDrag = (
    stageX: number,
    stageY: number,
    cropConstraints: CropConstraints,
  ): CropData | null => {
    if (!dragState.value.isDragging) return null

    const deltaX = stageX - dragState.value.startPos.x
    const deltaY = stageY - dragState.value.startPos.y

    // Update image position
    imageTransform.value.x = dragState.value.startTransform.x + deltaX
    imageTransform.value.y = dragState.value.startTransform.y + deltaY

    // Convert drag to crop change (inverse relationship)
    const scale = imageTransform.value.scale
    const cropDeltaX = -deltaX / scale
    const cropDeltaY = -deltaY / scale

    const newCrop: CropData = {
      x: dragState.value.startCrop.x + cropDeltaX,
      y: dragState.value.startCrop.y + cropDeltaY,
      width: dragState.value.startCrop.width,
      height: dragState.value.startCrop.height,
    }

    // Apply constraints
    return constraints.constrainCrop(newCrop, cropConstraints)
  }

  /**
   * Update resize operation
   */
  const updateResize = (
    stageX: number,
    stageY: number,
    cropConstraints: CropConstraints,
  ): CropData | null => {
    if (!dragState.value.isResizing || !dragState.value.resizeHandle) return null

    const deltaX = stageX - dragState.value.startPos.x
    const deltaY = stageY - dragState.value.startPos.y
    const scale = imageTransform.value.scale

    // Convert stage delta to image space
    const imageDeltaX = deltaX / scale
    const imageDeltaY = deltaY / scale

    const handle = dragState.value.resizeHandle
    const newCrop = { ...dragState.value.startCrop }

    // Apply resize based on handle
    switch (handle) {
      case 'nw':
        newCrop.x += imageDeltaX
        newCrop.y += imageDeltaY
        newCrop.width -= imageDeltaX
        newCrop.height -= imageDeltaY
        break
      case 'ne':
        newCrop.y += imageDeltaY
        newCrop.width += imageDeltaX
        newCrop.height -= imageDeltaY
        break
      case 'sw':
        newCrop.x += imageDeltaX
        newCrop.width -= imageDeltaX
        newCrop.height += imageDeltaY
        break
      case 'se':
        newCrop.width += imageDeltaX
        newCrop.height += imageDeltaY
        break
      case 'n':
        newCrop.y += imageDeltaY
        newCrop.height -= imageDeltaY
        break
      case 'e':
        newCrop.width += imageDeltaX
        break
      case 's':
        newCrop.height += imageDeltaY
        break
      case 'w':
        newCrop.x += imageDeltaX
        newCrop.width -= imageDeltaX
        break
    }

    // Apply constraints
    return constraints.constrainCrop(newCrop, cropConstraints)
  }

  /**
   * End drag/resize operation
   */
  const endDragResize = (): void => {
    dragState.value = {
      isDragging: false,
      isResizing: false,
      startPos: { x: 0, y: 0 },
      startTransform: { x: 0, y: 0, scale: 1 },
      startCrop: { x: 0, y: 0, width: 0, height: 0 },
    }
  }

  /**
   * Update transform when crop changes (from external source)
   */
  const updateTransformFromCrop = (
    newCrop: CropData,
    imageDimensions: { width: number; height: number },
    stageSize: { width: number; height: number },
  ): void => {
    const position = constraints.calculateImagePosition(
      imageDimensions,
      newCrop,
      imageTransform.value.scale,
      stageSize,
    )

    imageTransform.value.x = position.x
    imageTransform.value.y = position.y
  }

  return {
    // State
    imageTransform,
    dragState,
    isDragging,
    isResizing,

    // Actions
    initializeTransform,
    startDrag,
    startResize,
    updateDrag,
    updateResize,
    endDragResize,
    updateTransformFromCrop,
  }
}
