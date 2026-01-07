<!-- components/konva/CropOverlay.vue -->
<template>
  <v-layer
    v-if="
      isCropping &&
      originalImage &&
      visibleArea &&
      cropData &&
      originalImageDimensions &&
      isValidCropData
    "
  >
    <!-- 1. Full original image positioned at visible area -->
    <v-image
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: scaledImageWidth,
        height: scaledImageHeight,
        image: originalImage,
        opacity: 0.8,
        name: 'Full-original-image-positioned-at-visible-area',
      }"
    />

    <!-- 2. Dark mask over everything -->
    <v-rect
      :config="{
        x: 0,
        y: 0,
        width: stageWidth,
        height: stageHeight,
        fill: 'rgba(0, 0, 0, 0.7)',
        listening: false,
      }"
    />

    <!-- 3. Clear rectangle showing the crop area (punch hole in mask) -->
    <v-rect
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: visibleArea.width,
        height: visibleArea.height,
        fill: 'white',
        globalCompositeOperation: 'destination-out',
        listening: false,
      }"
    />

    <!-- 4. The actual cropped image visible in the clear area -->
    <v-image
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: visibleArea.width,
        height: visibleArea.height,
        image: originalImage,
        crop: {
          x: cropData.x,
          y: cropData.y,
          width: cropData.width,
          height: cropData.height,
        },
      }"
    />

    <!-- 5. Interactive crop handles and border -->
    <CropHandles
      v-if="validCropData"
      :visible-area="visibleArea"
      :crop-data="validCropData"
      :original-dimensions="originalImageDimensions"
      :aspect-ratio="aspectRatio"
      @update-crop="handleCropUpdate"
      @drag-crop="handleCropDrag"
    />

    <!-- 6. Control buttons (Apply/Cancel) -->
    <CropControls
      :stage-width="stageWidth"
      :stage-height="stageHeight"
      @apply="applyCrop"
      @cancel="cancelCrop"
    />
  </v-layer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCropping, type CropData } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import CropHandles from './CropHandles.vue'
import CropControls from './CropControls.vue'

const {
  isCropping,
  cropData,
  visibleArea,
  originalImageId,
  originalImageDimensions,
  aspectRatio,
  scaleX,
  scaleY,
  updateCropArea,
  applyCrop,
  cancelCrop,
} = useCropping()

const imageManager = useImageManager()

const originalImage = ref<HTMLImageElement | null>(null)

// Stage dimensions (will match FocusModeView)
const stageWidth = ref(1024)
const stageHeight = ref(768)

// Load the original image when cropping starts
watch(
  originalImageId,
  (imageId) => {
    if (imageId) {
      const imageElement = imageManager.getImageOptimized(imageId)
      originalImage.value = imageElement
    } else {
      originalImage.value = null
    }
  },
  { immediate: true },
)

// Calculate how the full original image should be scaled to fit the visible area
const scaledImageWidth = computed(() => {
  if (!visibleArea.value || !cropData.value || !originalImageDimensions.value) return 0
  return originalImageDimensions.value.naturalWidth * scaleX.value
})

const scaledImageHeight = computed(() => {
  if (!visibleArea.value || !cropData.value || !originalImageDimensions.value) return 0
  return originalImageDimensions.value.naturalHeight * scaleY.value
})

// Type guard to ensure cropData has all required properties
const isValidCropData = computed(() => {
  return (
    cropData.value &&
    typeof cropData.value.x === 'number' &&
    typeof cropData.value.y === 'number' &&
    typeof cropData.value.width === 'number' &&
    typeof cropData.value.height === 'number'
  )
})

// Properly typed crop data for components that require complete CropData
const validCropData = computed((): CropData | null => {
  if (!isValidCropData.value || !cropData.value) return null

  return {
    x: cropData.value.x!,
    y: cropData.value.y!,
    width: cropData.value.width!,
    height: cropData.value.height!,
  }
})

const handleCropUpdate = (newCrop: Partial<CropData>) => {
  if (!cropData.value || !isValidCropData.value) return

  // Merge with existing cropData to ensure all required properties
  const updatedCrop: CropData = {
    x: newCrop.x ?? cropData.value.x!,
    y: newCrop.y ?? cropData.value.y!,
    width: newCrop.width ?? cropData.value.width!,
    height: newCrop.height ?? cropData.value.height!,
  }

  updateCropArea(updatedCrop)
}

const handleCropDrag = (delta: { x: number; y: number }) => {
  if (!cropData.value || !isValidCropData.value) return

  const updatedCrop: CropData = {
    x: cropData.value.x! + delta.x,
    y: cropData.value.y! + delta.y,
    width: cropData.value.width!,
    height: cropData.value.height!,
  }

  updateCropArea(updatedCrop)
}
</script>
