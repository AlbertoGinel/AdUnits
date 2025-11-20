<!-- components/konva/ImageCropMode.vue -->
<template>
  <v-group v-if="shouldRender">
    <!-- Single full original image - draggable and resizable -->
    <v-image
      ref="imageRef"
      :config="{
        x: imagePosition.x,
        y: imagePosition.y,
        width: originalImageDimensions!.naturalWidth * imageScale,
        height: originalImageDimensions!.naturalHeight * imageScale,
        image: originalImage!,
        draggable: true,
        transformable: true,
        name: 'original-image-draggable',
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

const { cropData, updateCropArea, originalImageDimensions } = useCropping()
const { getImage } = useImageManager()

// Refs for Konva nodes - properly typed to avoid 'any' warnings
const imageRef = ref<{ getNode: () => Konva.Image } | null>(null)
const transformerRef = ref<{ getNode: () => Konva.Transformer } | null>(null)

// Get the visible area from element (where image appears on canvas)
const visibleArea = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.width || 0,
  height: props.element.height || 0,
}))

// Get the original image
const originalImage = computed(() => {
  if (!props.element.image) return null
  const imageData = getImage(props.element.image)
  return imageData?.image || null
})

// Calculate scale to fit original image in visible area
const imageScale = computed(() => {
  if (!cropData.value || !cropData.value.width || !visibleArea.value.width) return 1
  return visibleArea.value.width / cropData.value.width
})

// Calculate image position based on crop offset
const imagePosition = computed(() => {
  if (!cropData.value) return { x: visibleArea.value.x, y: visibleArea.value.y }

  const scale = imageScale.value
  return {
    x: visibleArea.value.x - cropData.value.x * scale,
    y: visibleArea.value.y - cropData.value.y * scale,
  }
})

// Check if everything is ready to render
const shouldRender = computed(() => {
  const hasImage = originalImage.value !== null
  const hasCrop = cropData.value !== null
  const hasCropDimensions =
    cropData.value?.width !== undefined && cropData.value?.height !== undefined
  const hasValidArea = visibleArea.value.width > 0 && visibleArea.value.height > 0
  const hasDimensions = originalImageDimensions.value !== null

  return hasImage && hasCrop && hasCropDimensions && hasValidArea && hasDimensions
})

// Attach transformer to image - using watchEffect for cleaner reactivity
watchEffect(() => {
  // Access reactive dependencies
  if (!shouldRender.value || !imageRef.value || !transformerRef.value) {
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

// Constrain crop to stay within original image bounds
const constrainCrop = (nodeState: { x: number; y: number; scaleX: number; scaleY: number }) => {
  if (!cropData.value || !originalImageDimensions.value) return null

  // Type guard: ensure width and height exist
  if (cropData.value.width === undefined || cropData.value.height === undefined) return null

  // Calculate deltas from expected position
  const expectedX = imagePosition.value.x
  const expectedY = imagePosition.value.y
  const deltaX = nodeState.x - expectedX
  const deltaY = nodeState.y - expectedY

  // Convert deltas to original image space
  const scale = imageScale.value
  const imageDeltaX = deltaX / scale
  const imageDeltaY = deltaY / scale

  // Calculate new crop size from scale
  // Use average of both scales to handle edge handles properly
  const averageScale = (nodeState.scaleX + nodeState.scaleY) / 2
  const newScale = scale * averageScale
  const newCropWidth = visibleArea.value.width / newScale
  const newCropHeight = visibleArea.value.height / newScale

  // Calculate new crop with all changes
  const newCrop = {
    x: cropData.value.x - imageDeltaX,
    y: cropData.value.y - imageDeltaY,
    width: newCropWidth,
    height: newCropHeight,
  }

  // TODO: Add constraints here

  return newCrop
}

const handleChange = (e: KonvaEventObject<DragEvent>) => {
  if (!cropData.value || !originalImageDimensions.value) return

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
