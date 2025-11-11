<template>
  <!-- Show image if loaded -->
  <v-image v-if="loadedImage" :config="imageConfig" />
  <!-- Fallback rectangle if not loaded -->
  <v-rect v-else :config="fallbackConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useImageStore } from '@/services/reactiveImageStore'
import type { CanvasElement } from '@/stores/canvas'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

// ✅ Use the image store composable
const imageStore = useImageStore()

// ✅ Reactive loaded image that updates when image finishes loading
const loadedImage = computed(() => {
  if (!props.element.image) {
    console.log(`🖼️ KonvaImage ${props.element.id}: No URL provided`)
    return null
  }

  const loaded = imageStore.getLoadedImage(props.element.image)

  // ✅ Extra validation for Konva compatibility
  const isValidImage = loaded && loaded.complete && loaded.naturalWidth > 0

  console.log(
    `🖼️ KonvaImage ${props.element.id}: url=${props.element.image}, loaded=${!!loaded}, valid=${isValidImage}, showing=${isValidImage ? 'v-image' : 'v-rect'}`,
  )

  if (loaded) {
    console.log(`🎨 Image object details:`, {
      width: loaded.width,
      height: loaded.height,
      naturalWidth: loaded.naturalWidth,
      naturalHeight: loaded.naturalHeight,
      complete: loaded.complete,
      src: loaded.src,
    })
  }

  return isValidImage ? loaded : null
})

const imageConfig = computed(() => {
  const config = {
    x: props.element.x,
    y: props.element.y,
    width: props.element.width,
    height: props.element.height,
    image: loadedImage.value,
    crop: props.element.crop
      ? {
          x: props.element.crop.x,
          y: props.element.crop.y,
          width: props.element.crop.width || props.element.width,
          height: props.element.crop.height || props.element.height,
        }
      : undefined,
  }

  if (loadedImage.value) {
    console.log(`🎨 Konva image config for ${props.element.id}:`, {
      position: { x: config.x, y: config.y },
      size: { width: config.width, height: config.height },
      hasImage: !!config.image,
      imageSize: config.image ? { w: config.image.width, h: config.image.height } : null,
    })
  }

  return config
})

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
