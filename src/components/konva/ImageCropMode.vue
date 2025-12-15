<!-- components/konva/ImageCropMode.vue -->
<template>
  <v-group v-if="shouldRenderCropMode">
    <!-- Single full original image - draggable and resizable -->
    <v-image
      ref="imageRef"
      :config="{
        x: imagePosition.x,
        y: imagePosition.y,
        width: originalImageDimensions!.naturalWidth * imageScale,
        height: originalImageDimensions!.naturalHeight * imageScale,
        image: imageElement!,
        draggable: true,
        transformable: true,
      }"
      @dragmove="handleChange"
      @transform="handleChange"
    />

    <!-- Konva Transformer - provides handles automatically -->
    <v-transformer
      ref="transformerRef"
      :config="{
        enabledAnchors: [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
          'middle-left',
          'middle-right',
          'top-center',
          'bottom-center',
        ],
        keepRatio: true,
        rotateEnabled: false, // ← Disable rotation
        borderStroke: '#00aaff',
        borderStrokeWidth: 3,
        anchorFill: 'white',
        anchorStroke: '#00aaff',
        anchorStrokeWidth: 2,
        anchorSize: 10,
      }"
    />

    <!-- Crop border (dashed red line) - FIXED showing the visible area -->
    <v-rect
      v-if="visibleArea"
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: visibleArea.width,
        height: visibleArea.height,
        stroke: '#ff0000',
        strokeWidth: 3,
        dash: [10, 5],
        listening: false,
        name: 'visible-area-border',
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, nextTick } from 'vue'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { CanvasElement } from '@/stores/canvas'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

const {
  updateCropArea,
  originalImageDimensions,
  visibleArea,
  imageScale,
  imagePosition,
  shouldRenderCropMode,
  constrainCrop,
} = useCropping()
const { getImageOptimized } = useImageManager()

// Refs for Konva nodes - properly typed to avoid 'any' warnings
const imageRef = ref<{ getNode: () => Konva.Image } | null>(null)
const transformerRef = ref<{ getNode: () => Konva.Transformer } | null>(null)

// Get the actual image element for Konva rendering
const imageElement = computed(() => {
  if (!props.element.image) return null
  return getImageOptimized(props.element.image)
})

// Attach transformer to image - using watchEffect for cleaner reactivity
watchEffect(() => {
  // Access reactive dependencies
  if (!shouldRenderCropMode.value || !imageRef.value || !transformerRef.value) {
    return
  }

  // Wait for next tick to ensure DOM is updated
  nextTick(() => {
    const imageNode = imageRef.value?.getNode() as Konva.Image | undefined
    const transformer = transformerRef.value?.getNode() as Konva.Transformer | undefined

    if (imageNode && transformer) {
      transformer.nodes([imageNode])
    }
  })
})

// Handle drag/transform events - just pass node state to useCropping
const handleChange = (e: KonvaEventObject<DragEvent>) => {
  const node = e.target as Konva.Image

  // Pass raw node state to constrainCrop for calculation
  const constrainedCrop = constrainCrop({
    x: node.x(),
    y: node.y(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
  })

  if (constrainedCrop) {
    updateCropArea(constrainedCrop)
  }

  // Reset node to expected state
  node.scaleX(1)
  node.scaleY(1)
  node.position({ x: imagePosition.value.x, y: imagePosition.value.y })
}
</script>
