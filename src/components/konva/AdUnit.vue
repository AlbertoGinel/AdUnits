<!-- components/konva/AdUnit.vue -->
<template>
  <!-- Pure ad unit rendering at 0,0 - no frame, no positioning -->
  <v-group>
    <template v-for="elementData in renderableElements" :key="elementData.elementId">
      <!-- Text Elements -->
      <v-text
        v-if="elementData.element.type === 'text' && elementData.visible"
        :config="elementData.config"
      />

      <!-- Rectangle Elements -->
      <v-rect
        v-else-if="elementData.element.type === 'rect' && elementData.visible"
        :config="elementData.config"
      />

      <!-- Image Elements -->
      <template v-else-if="elementData.element.type === 'image'">
        <!-- Cropping mode - only for 'image' element, never for 'logo' -->
        <ImageCropMode
          v-if="elementData.isCropping && elementData.elementId === 'image'"
          :element="elementData.element"
        />

        <!-- Normal mode with loaded image -->
        <v-image
          v-else-if="
            elementData.loadedImage && elementData.visible && debugImageConfig(elementData)
          "
          :config="debugImageConfig(elementData)"
        />

        <!-- Fallback rectangle -->
        <v-rect
          v-else-if="elementData.visible"
          :config="{
            x: elementData.element.x,
            y: elementData.element.y,
            width: elementData.element.width,
            height: elementData.element.height,
            fill: elementData.element.fill || '#e0e0e0',
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
import { useAdUnitRendering } from '@/composables/view/useAdUnitRendering'
import ImageCropMode from './ImageCropMode.vue'

interface Props {
  adUnitId: string
}

const props = defineProps<Props>()
const rendering = useAdUnitRendering()

// Get all renderable elements (all logic in composable)
const renderableElements = computed(() => {
  return rendering.getAdUnitRenderableElements(props.adUnitId)
})

// Safe image config - ensures valid image before rendering
const debugImageConfig = (elementData: {
  config: object
  loadedImage: HTMLImageElement | null
}) => {
  const config = elementData.config
  const img = elementData.loadedImage

  // Only return config if image is truly ready
  if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    return config
  }

  // Return null to prevent rendering invalid images
  return null
}
</script>
