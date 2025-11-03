<template>
  <!-- Show image if loaded -->
  <v-image v-if="getLoadedImage(element.image)" :config="imageConfig" />
  <!-- Fallback rectangle if not loaded -->
  <v-rect v-else :config="fallbackConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CanvasInitializer } from '@/services/canvasInitializer'
import type { CanvasElement } from '@/stores/canvas'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

const getLoadedImage = (url?: string | null) => {
  if (!url) {
    return null
  }
  return CanvasInitializer.getLoadedImage(url)
}

const imageConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.width,
  height: props.element.height,
  image: getLoadedImage(props.element.image),
  crop: props.element.crop
    ? {
        x: props.element.crop.x,
        y: props.element.crop.y,
        width: props.element.crop.width || props.element.width,
        height: props.element.crop.height || props.element.height,
      }
    : undefined,
}))

const fallbackConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.width,
  height: props.element.height,
  fill: '#f0f0f0',
  stroke: '#cccccc',
  strokeWidth: 1,
}))
</script>
