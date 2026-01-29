import { ref, computed } from 'vue'
import type { Ref } from 'vue'
//import type { AdUnit } from '@/types/adUnitElementTypes'
import { useViewState } from '@/features/stage/composables/useViewState'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useImageService } from '@/data/services/useImageService'
import { useFieldService } from '@/data/services/useFieldService'
import Konva from 'konva'

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export interface CropState {
  isActive: boolean
  currentAdUnitId: string | null
  originalCrop: CropData | null
  workingCrop: CropData | null
  imageDimensions: { width: number; height: number } | null
  frameSize: { width: number; height: number } | null
}

// Vue-konva component ref type (same as useElementHighlight)
interface VueKonvaStageRef {
  getNode(): Konva.Stage // Returns the actual Konva Stage
}

// Singleton state
let sharedCropInstance: ReturnType<typeof createCropMode> | null = null

export function useCropMode(stageRef?: Ref<VueKonvaStageRef | null>) {
  // If already created, return existing instance (ignore any new stageRef)
  if (sharedCropInstance) {
    return sharedCropInstance
  }

  // If not created and no stage provided, error
  if (!stageRef) {
    throw new Error(
      '🎯 Crop mode not initialized - stageRef required for first use (call from CanvasScreen)',
    )
  }

  // Create new instance with stage (first time only)
  sharedCropInstance = createCropMode(stageRef)
  return sharedCropInstance
}

function createCropMode(stageRef: Ref<VueKonvaStageRef | null>) {
  const viewState = useViewState()
  const adUnitStore = useAdUnitStore()
  const imageService = useImageService()
  const fieldService = useFieldService()

  // Core crop state
  const cropState = ref<CropState>({
    isActive: false,
    currentAdUnitId: null,
    originalCrop: null,
    workingCrop: null,
    imageDimensions: null,
    frameSize: null,
  })

  // Computed properties
  const isActive = computed(() => cropState.value.isActive)
  const currentAdUnit = computed(() => {
    if (!cropState.value.currentAdUnitId) return null
    return adUnitStore.getAdUnit(cropState.value.currentAdUnitId) || null
  })

  const canStartCrop = computed(() => {
    // Just check basic prerequisites - detailed validation in startCrop
    return viewState.isFocusMode.value && viewState.currentAdUnit.value !== null
  })

  /**
   * Start crop mode for the currently focused adUnit
   */
  const startCrop = async (): Promise<boolean> => {
    try {
      // Get adUnit once and validate everything here
      const adUnit = viewState.currentAdUnit.value
      if (!adUnit) {
        console.warn('⚠️ No current adUnit')
        return false
      }

      // Check if we're in focus mode
      if (!viewState.isFocusMode.value) {
        console.warn('⚠️ Not in focus mode')
        return false
      }

      // Get image ID using field service - this validates image exists
      const imageID = fieldService.getFieldValue('image', 'imageID')
      if (!imageID) {
        console.warn('⚠️ No image ID found for adUnit')
        return false
      }

      // Get image element for frame dimensions
      const imageElement = adUnitStore.getElement(adUnit.id, 'image')
      if (!imageElement?.width || !imageElement?.height) {
        console.warn('⚠️ No frame dimensions for adUnit')
        return false
      }

      // Get existing crop data using store method
      const existingCrop = adUnitStore.getCropData(adUnit.id)

      // Get image dimensions
      const dimensions = await imageService.getNaturalDimensions(imageID)
      if (!dimensions) {
        console.error('❌ Could not get image dimensions')
        return false
      }

      // Set up crop state
      cropState.value = {
        isActive: true,
        currentAdUnitId: adUnit.id,
        originalCrop: existingCrop ? { ...existingCrop } : null,
        workingCrop: existingCrop ? { ...existingCrop } : null,
        imageDimensions: dimensions,
        frameSize: {
          width: imageElement.width,
          height: imageElement.height,
        },
      }

      console.log('✅ Crop mode started for:', adUnit.id)
      return true
    } catch (error) {
      console.error('❌ Failed to start crop mode:', error)
      return false
    }
  }

  /**
   * Apply the working crop to the adUnit and exit crop mode
   */
  const applyCrop = (): boolean => {
    try {
      if (
        !cropState.value.isActive ||
        !cropState.value.currentAdUnitId ||
        !cropState.value.workingCrop
      ) {
        return false
      }

      // Update the adUnit with the new crop data
      adUnitStore.setCropData(cropState.value.currentAdUnitId, cropState.value.workingCrop)

      // Clear crop state
      cropState.value = {
        isActive: false,
        currentAdUnitId: null,
        originalCrop: null,
        workingCrop: null,
        imageDimensions: null,
        frameSize: null,
      }

      console.log('✅ Crop applied and mode exited')
      return true
    } catch (error) {
      console.error('❌ Failed to apply crop:', error)
      return false
    }
  }

  /**
   * Cancel crop mode without applying changes
   */
  const cancelCrop = (): boolean => {
    try {
      if (!cropState.value.isActive) {
        return false
      }

      // Just clear crop state without applying changes
      cropState.value = {
        isActive: false,
        currentAdUnitId: null,
        originalCrop: null,
        workingCrop: null,
        imageDimensions: null,
        frameSize: null,
      }

      console.log('✅ Crop cancelled and mode exited')
      return true
    } catch (error) {
      console.error('❌ Failed to cancel crop:', error)
      return false
    }
  }

  /**
   * Update the working crop data (used during dragging/resizing)
   */
  const updateWorkingCrop = (newCrop: Partial<CropData>): boolean => {
    try {
      if (!cropState.value.isActive || !cropState.value.workingCrop) {
        return false
      }

      cropState.value.workingCrop = {
        ...cropState.value.workingCrop,
        ...newCrop,
      }

      return true
    } catch (error) {
      console.error('❌ Failed to update working crop:', error)
      return false
    }
  }

  /**
   * Get stage reference (for coordinate calculations)
   */
  const getStage = (): Konva.Stage | null => {
    return stageRef.value?.getNode() || null
  }

  return {
    // State
    cropState: cropState.value,
    isActive,
    currentAdUnit,
    canStartCrop,

    // Actions
    startCrop,
    applyCrop,
    cancelCrop,
    updateWorkingCrop,

    // Utilities
    getStage,
  }
}
