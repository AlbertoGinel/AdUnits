<!-- components/konva/CropOverlay.vue -->
<template>
  <v-layer v-if="isCropping && originalImage && visibleArea && cropData && originalImageDimensions">
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
      :visible-area="visibleArea"
      :crop-data="cropData"
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
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import CropHandles from './CropHandles.vue'
import CropControls from './CropControls.vue'
import type { CropData } from '@/stores/useCroppingStore'

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

const { getImage } = useImageManager()

const originalImage = ref<HTMLImageElement | null>(null)

// Stage dimensions (will match FocusModeView)
const stageWidth = ref(1024)
const stageHeight = ref(768)

// Load the original image when cropping starts
watch(
  originalImageId,
  (imageId) => {
    if (imageId) {
      const imageData = getImage(imageId)
      if (imageData) {
        originalImage.value = imageData.image
      }
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

const handleCropUpdate = (newCrop: Partial<CropData>) => {
  updateCropArea(newCrop)
}

const handleCropDrag = (delta: { x: number; y: number }) => {
  if (!cropData.value) return

  updateCropArea({
    x: cropData.value.x + delta.x,
    y: cropData.value.y + delta.y,
  })
}
</script>
