<!-- components/konva/ImageCropMode.vue -->
<template>
  <v-group v-if="shouldRenderCropMode" :config="{ name: 'crop-mode-root' }">
    <!-- Dimmed full image (background layer) -->
    <v-image
      :config="{
        x: imagePosition.x,
        y: imagePosition.y,
        width: originalImageDimensions!.naturalWidth * imageScale,
        height: originalImageDimensions!.naturalHeight * imageScale,
        image: imageElement!,
        opacity: 0.4,
        listening: false,
        name: 'dimmed-background-image',
      }"
    />

    <!-- Invisible draggable image - covers full area for interaction -->
    <v-image
      ref="imageRef"
      :config="{
        x: imagePosition.x,
        y: imagePosition.y,
        width: originalImageDimensions!.naturalWidth * imageScale,
        height: originalImageDimensions!.naturalHeight * imageScale,
        image: imageElement!,
        draggable: true,
        opacity: 0,
        name: 'invisible-drag-layer',
      }"
      @dragmove="handleChange"
      @transform="handleChange"
      @transformend="handleChange"
    />

    <!-- Clipped group - visual only, shows bright image in crop area -->
    <v-group
      v-if="visibleArea"
      :config="{
        clip: {
          x: visibleArea.x,
          y: visibleArea.y,
          width: visibleArea.width,
          height: visibleArea.height,
        },
        listening: false,
        name: 'clipped-crop-area',
      }"
    >
      <!-- Bright image (clipped) - visual representation only -->
      <v-image
        :config="{
          x: imagePosition.x,
          y: imagePosition.y,
          width: originalImageDimensions!.naturalWidth * imageScale,
          height: originalImageDimensions!.naturalHeight * imageScale,
          image: imageElement!,
          listening: false,
          name: 'bright-visual-image',
        }"
      />
    </v-group>

    <!-- Konva Transformer - provides resize handles -->
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
        rotateEnabled: false,
        borderStroke: '#00aaff',
        borderStrokeWidth: 3,
        anchorFill: 'white',
        anchorStroke: '#00aaff',
        anchorStrokeWidth: 2,
        anchorSize: 10,
        name: 'crop-transformer',
        boundBoxFunc: (oldBox: any, newBox: any) => {
          // Prevent negative scales and flipping
          const minWidth = 20
          const minHeight = 20

          // If new box would be too small, keep old box
          if (newBox.width < minWidth || newBox.height < minHeight) {
            return oldBox
          }

          return newBox
        },
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
