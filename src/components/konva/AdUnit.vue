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

        <!-- Fallback with icon and gradient -->
        <v-group v-else-if="elementData.visible">
          <!-- Background with gradient -->
          <v-rect
            :config="{
              x: elementData.element.x,
              y: elementData.element.y,
              width: elementData.element.width,
              height: elementData.element.height,
              fill: '#D5D9DD',
              stroke: '#dee2e6',
              strokeWidth: 1,
            }"
          />

          <!-- SVG icon using v-image -->
          <v-image
            v-if="
              (elementData.element.width || 0) > 40 &&
              (elementData.element.height || 0) > 40 &&
              fallbackIconImage
            "
            :config="{
              x: elementData.element.x + (elementData.element.width || 0) / 2 - 10,
              y: elementData.element.y + (elementData.element.height || 0) / 2 - 10,
              width: 20,
              height: 20,
              image: fallbackIconImage,
              opacity: 0.7,
            }"
          />
        </v-group>
      </template>
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAdUnitRendering } from '@/composables/view/useAdUnitRendering'
import { useIcons } from '@/composables/utils/useIcons'
import ImageCropMode from './ImageCropMode.vue'

interface Props {
  adUnitId: string
}

const props = defineProps<Props>()
const rendering = useAdUnitRendering()
const { getIcon } = useIcons()

// Convert SVG to image element for Konva
const fallbackIconImage = ref<HTMLImageElement | null>(null)

onMounted(() => {
  const svgString = getIcon('imageTool')
  const svg = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svg)

  const img = new Image()
  img.onload = () => {
    fallbackIconImage.value = img
    URL.revokeObjectURL(url) // Clean up
  }
  img.src = url
})

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
