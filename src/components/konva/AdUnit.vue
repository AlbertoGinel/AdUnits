<!-- components/konva/AdUnit.vue -->
<template>
  <!-- Pure ad unit rendering at 0,0 - no frame, no positioning -->
  <v-group>
    <template v-for="[elementId, element] in adUnitElements" :key="elementId">
      <!-- Text Elements -->
      <v-text
        v-if="element.type === 'text' && element.visibility !== false"
        :config="getElementConfig(element, elementId)"
      />

      <!-- Rectangle Elements -->
      <v-rect
        v-else-if="element.type === 'rect' && element.visibility !== false"
        :config="{
          ...getElementConfig(element, elementId),
          ...(element.fillLinearGradientStartPoint && {
            fillLinearGradientStartPoint: element.fillLinearGradientStartPoint,
            fillLinearGradientEndPoint: element.fillLinearGradientEndPoint,
            fillLinearGradientColorStops: element.fillLinearGradientColorStops,
          }),
        }"
      />

      <!-- Image Elements -->
      <template v-else-if="element.type === 'image'">
        <!-- CROPPING MODE: Show crop interface -->
        <ImageCropMode v-if="isCroppingThisElement(elementId)" :element="element" />

        <!-- NORMAL MODE: Show image if loaded -->
        <v-image
          v-else-if="element.image && getLoadedImage(element.image)"
          :config="getElementConfig(element, elementId)"
        />

        <!-- Fallback colored rectangle when image doesn't load -->
        <v-rect
          v-else
          :config="{
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            fill: element.fill || '#e0e0e0',
            stroke: '#cccccc',
            strokeWidth: 0,
          }"
        />
      </template>
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdUnit, CanvasElement } from '@/stores/canvas'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useElementRenderer } from '@/composables/view/useElementRenderer'
import { useCropping } from '@/composables/Tools/useCropping'
import ImageCropMode from './ImageCropMode.vue'

// ✅ Props - receives AdUnit, renders at 0,0
interface Props {
  adUnit: AdUnit
}

const props = defineProps<Props>()
const { getImage } = useImageManager()
const { renderElement } = useElementRenderer()
const { isCropping } = useCropping()

// ✅ Computed optimization - only recalculate when adUnit elements change
const adUnitElements = computed(() => {
  return Object.entries(props.adUnit.elements)
})

// ✅ Check if we're cropping this specific element
const isCroppingThisElement = (elementId: string): boolean => {
  return isCropping.value && elementId === 'image'
}

// ✅ Get loaded image by ID from the image manager
const getLoadedImage = (imageId?: string): HTMLImageElement | null => {
  if (!imageId) return null

  const imageData = getImage(imageId)
  return imageData?.image || null
}

// ✅ Get rendered element config with proper cropping
const getElementConfig = (element: CanvasElement, elementId: string): Record<string, unknown> => {
  const renderedElement = renderElement(element, elementId)

  // For images, inject the actual loaded image
  if (element.type === 'image' && element.image) {
    const loadedImage = getLoadedImage(element.image)
    if (loadedImage) {
      // Safely add image property to the config
      const config = renderedElement.config as Record<string, unknown>
      config.image = loadedImage
      return config
    }
  }

  return renderedElement.config
}
</script>
