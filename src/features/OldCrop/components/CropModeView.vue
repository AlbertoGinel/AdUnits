<template>
  <v-group v-if="shouldShowCropMode">
    <!-- Full Image Layer (with transform) -->
    <v-group
      :config="{
        x: imageTransform.x,
        y: imageTransform.y,
        scaleX: imageTransform.scale,
        scaleY: imageTransform.scale,
      }"
    >
      <!-- Full Image -->
      <v-image
        :config="{
          image: fullImage,
          width: imageDimensions?.width || 0,
          height: imageDimensions?.height || 0,
          listening: false,
        }"
      />

      <!-- Crop Mask (areas outside crop are dimmed) -->
      <CropMask
        v-if="workingCrop && imageDimensions"
        :crop-area="workingCrop"
        :image-dimensions="imageDimensions"
      />
    </v-group>

    <!-- Crop Overlay (interactive area showing exact crop bounds) -->
    <CropOverlay
      v-if="workingCrop && frameSize && imageDimensions"
      :crop-data="workingCrop"
      :frame-size="frameSize"
      :image-transform="imageTransform"
      :image-dimensions="imageDimensions"
      @crop-change="handleCropChange"
    />

    <!-- Invisible drag layer for panning -->
    <v-rect
      :config="{
        x: 0,
        y: 0,
        width: stageSize.width,
        height: stageSize.height,
        fill: 'transparent',
        listening: true,
      }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCropTransform } from '../composables/useCropTransform'
import { useImageService } from '@/data/services/useImageService'
import { useFieldService } from '@/data/services/useFieldService'
import CropMask from './CropMask.vue'
import CropOverlay from './CropOverlay.vue'
import type { CropData, CropState } from '../composables/useCropMode'
import type Konva from 'konva'

// Type for useCropMode return value
type CropModeInstance = {
  cropState: CropState
  isActive: ReturnType<typeof computed<boolean>>
  currentAdUnit: ReturnType<typeof computed>
  canStartCrop: ReturnType<typeof computed<boolean>>
  startCrop: () => Promise<boolean>
  applyCrop: () => boolean
  cancelCrop: () => boolean
  updateWorkingCrop: (newCrop: Partial<CropData>) => boolean
  getStage: () => Konva.Stage | null
}

// Lazy import crop mode - only when actually needed
const getCropMode = async () => {
  try {
    const { useCropMode } = await import('../composables/useCropMode')
    return useCropMode()
  } catch {
    return null
  }
}
//import type { ImageTransform } from '../composables/useCropTransform'

const cropTransform = useCropTransform()
const imageService = useImageService()
const fieldService = useFieldService()

// Safe crop mode access
const cropMode = ref<CropModeInstance | null>(null)
const shouldShowCropMode = computed(() => cropMode.value?.cropState.isActive || false)

// Initialize crop mode when needed
const initCropMode = async () => {
  if (!cropMode.value) {
    cropMode.value = await getCropMode()
  }
}

// Reactive state
const fullImage = ref<HTMLImageElement | null>(null)
const stageSize = ref({ width: 800, height: 600 }) // TODO: Get from stage

// Computed properties
//const currentAdUnit = computed(() => cropMode.currentAdUnit.value)
const imageDimensions = computed(() => cropMode.value?.cropState.imageDimensions || null)
const frameSize = computed(() => cropMode.value?.cropState.frameSize || null)
const workingCrop = computed(() => cropMode.value?.cropState.workingCrop || null)
const imageTransform = computed(() => cropTransform.imageTransform.value)

/**
 * Load the full image for display
 */
const loadFullImage = async () => {
  // Get image ID using field service
  const imageID = fieldService.getFieldValue('image', 'imageID')
  if (!imageID) return

  try {
    const imageElement = await imageService.getImageElement(imageID)
    fullImage.value = imageElement
  } catch (error) {
    console.error('❌ Failed to load full image:', error)
  }
}

/**
 * Initialize crop transform
 */
const initializeCropView = () => {
  if (!imageDimensions.value || !workingCrop.value || !frameSize.value) return

  cropTransform.initializeTransform(
    imageDimensions.value,
    workingCrop.value,
    frameSize.value,
    stageSize.value,
  )
}

/**
 * Handle crop data changes from overlay
 */
const handleCropChange = (newCrop: CropData) => {
  const cm = cropMode.value
  if (cm) {
    cm.updateWorkingCrop(newCrop)

    // Update image transform to follow crop
    if (imageDimensions.value) {
      cropTransform.updateTransformFromCrop(newCrop, imageDimensions.value, stageSize.value)
    }
  }
}

/**
 * Mouse event handlers for dragging
 */
const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (!workingCrop.value) return

  const pos = e.target.getStage()?.getPointerPosition()
  if (pos) {
    cropTransform.startDrag(pos.x, pos.y, workingCrop.value)
  }
}

const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (!cropTransform.isDragging.value || !imageDimensions.value || !frameSize.value) return

  const pos = e.target.getStage()?.getPointerPosition()
  if (pos) {
    const newCrop = cropTransform.updateDrag(pos.x, pos.y, {
      imageDimensions: imageDimensions.value,
      frameSize: frameSize.value,
    })

    if (newCrop) {
      const cm = cropMode.value
      if (cm) {
        cm.updateWorkingCrop(newCrop)
      }
    }
  }
}

const handleMouseUp = () => {
  cropTransform.endDragResize()
}

// Lifecycle
onMounted(async () => {
  await initCropMode()
  await loadFullImage()
  initializeCropView()
})

// Watch for crop state changes
watch(
  [imageDimensions, workingCrop, frameSize],
  () => {
    initializeCropView()
  },
  { deep: true },
)
</script>
