<template>
  <!-- Main image layer - exact positioning -->
  <v-image
    v-if="renderCrop.shouldShowImage.value"
    ref="mainImageRef"
    :config="renderCrop.fullImageConfig.value"
    @dragstart="handleDragStart"
    @dragmove="handleChange"
  />

  <!-- Transform layer - handles only -->
  <v-transformer
    v-if="renderCrop.shouldShowImage.value"
    ref="transformerRef"
    :config="{
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotateEnabled: false,
      borderEnabled: true,
      anchorSize: 8,
      anchorStroke: '#ff6b35',
      anchorFill: 'white',
      anchorStrokeWidth: 2,
      borderStroke: '#ff6b35',
      borderStrokeWidth: 2,
    }"
    @transformstart="handleTransformStart"
    @transform="handleChange"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, watch } from 'vue'
import { useRenderCrop } from '../composables/useRenderCrop'
import { useCropState } from '../composables/useCropState'
import type { RenderableElement } from '@/features/stage/composables/useRendering'
import type { FrameConfig } from '@/types/cropTypes'
import type Konva from 'konva'

interface Props {
  renderData: RenderableElement
}

const props = defineProps<Props>()
const renderCrop = useRenderCrop()
const cropState = useCropState()

// Refs for Vue-Konva component instances
const mainImageRef = ref<{ getNode: () => Konva.Image } | null>(null)
const transformerRef = ref<{ getNode: () => Konva.Transformer } | null>(null)

// Attach transformer to image when both are ready
const attachTransformer = async () => {
  await nextTick()

  if (mainImageRef.value && transformerRef.value) {
    const imageNode = mainImageRef.value.getNode()
    const transformerNode = transformerRef.value.getNode()

    if (imageNode && transformerNode) {
      transformerNode.nodes([imageNode])
      transformerNode.getLayer()?.batchDraw()
      console.log('🔧 Transformer attached to image')
    }
  }
}

// Store previous position for revert capability
let previousPosition = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

// Handle drag start - capture position before movement
const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
  const target = e.target as Konva.Image
  previousPosition = {
    x: target.x(),
    y: target.y(),
    scaleX: target.scaleX(),
    scaleY: target.scaleY(),
  }
}

// Handle transform start - capture position before movement
const handleTransformStart = (e: Konva.KonvaEventObject<Event>) => {
  const target = e.target as Konva.Image
  previousPosition = {
    x: target.x(),
    y: target.y(),
    scaleX: target.scaleX(),
    scaleY: target.scaleY(),
  }
}

// Extract frame config from Konva node with proper typing
const extractFrameConfig = (target: Konva.Image): FrameConfig => ({
  x: target.x(),
  y: target.y(),
  width: target.width() * target.scaleX(),
  height: target.height() * target.scaleY(),
})

// Handle both drag and transform events - extract data and send clean frameConfig
const handleChange = (e: Konva.KonvaEventObject<DragEvent | Event>) => {
  const target = e.target as Konva.Image

  const proposedFrameConfig = extractFrameConfig(target)

  // Send through validation pipeline
  const validatedFrameConfig = cropState.handleFrameChange(proposedFrameConfig)

  if (!validatedFrameConfig) {
    // REVERT: Movement blocked - restore previous position
    target.x(previousPosition.x)
    target.y(previousPosition.y)
    target.scaleX(previousPosition.scaleX)
    target.scaleY(previousPosition.scaleY)
    target.getLayer()?.batchDraw() // Force redraw
  }
  // If validatedFrameConfig exists, allow the movement (already applied by Konva)
}

onMounted(async () => {
  await renderCrop.initializeFromRenderData(props.renderData)
})

// Watch for when image actually loads and shows
watch(
  () => renderCrop.shouldShowImage.value,
  async (shouldShow) => {
    if (shouldShow) {
      console.log('🎯 Image is now ready, attaching transformer')
      await nextTick() // Wait for v-image and v-transformer to render
      await attachTransformer()
    }
  },
  { immediate: false }, // Don't run immediately
)
</script>
