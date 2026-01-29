<template>
  <v-group>
    <!-- Crop boundary rectangle -->
    <v-rect
      :config="{
        x: overlayPosition.x,
        y: overlayPosition.y,
        width: frameSize.width,
        height: frameSize.height,
        stroke: '#ff6b35',
        strokeWidth: 2,
        fill: 'transparent',
        listening: false,
        dash: [5, 5],
      }"
    />

    <!-- Corner handles -->
    <CropHandle
      v-for="handle in cornerHandles"
      :key="handle.position"
      :x="handle.x"
      :y="handle.y"
      :position="handle.position"
      @drag-start="handleResizeStart"
      @drag="handleResize"
      @drag-end="handleResizeEnd"
    />

    <!-- Edge handles -->
    <CropHandle
      v-for="handle in edgeHandles"
      :key="handle.position"
      :x="handle.x"
      :y="handle.y"
      :position="handle.position"
      @drag-start="handleResizeStart"
      @drag="handleResize"
      @drag-end="handleResizeEnd"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCropTransform } from '../composables/useCropTransform'
//import { useCropConstraints } from '../composables/useCropConstraints'
import CropHandle from './CropHandle.vue'
import type { CropData } from '../composables/useCropMode'
import type { ImageTransform } from '../composables/useCropTransform'

interface Props {
  cropData: CropData
  frameSize: { width: number; height: number }
  imageTransform: ImageTransform
  imageDimensions: { width: number; height: number }
}

interface Emits {
  (e: 'crop-change', newCrop: CropData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const cropTransform = useCropTransform()
//const cropConstraints = useCropConstraints()

// Calculate overlay position based on crop and image transform
const overlayPosition = computed(() => {
  const { x, y, scale } = props.imageTransform
  return {
    x: x + props.cropData.x * scale,
    y: y + props.cropData.y * scale,
  }
})

// Corner handles
const cornerHandles = computed(() => {
  const { x, y } = overlayPosition.value
  const { width, height } = props.frameSize

  return [
    { position: 'nw' as const, x: x - 4, y: y - 4 },
    { position: 'ne' as const, x: x + width - 4, y: y - 4 },
    { position: 'sw' as const, x: x - 4, y: y + height - 4 },
    { position: 'se' as const, x: x + width - 4, y: y + height - 4 },
  ]
})

// Edge handles
const edgeHandles = computed(() => {
  const { x, y } = overlayPosition.value
  const { width, height } = props.frameSize

  return [
    { position: 'n' as const, x: x + width / 2 - 4, y: y - 4 },
    { position: 'e' as const, x: x + width - 4, y: y + height / 2 - 4 },
    { position: 's' as const, x: x + width / 2 - 4, y: y + height - 4 },
    { position: 'w' as const, x: x - 4, y: y + height / 2 - 4 },
  ]
})

/**
 * Handle resize start
 */
const handleResizeStart = (position: string, stagePos: { x: number; y: number }) => {
  cropTransform.startResize(
    stagePos.x,
    stagePos.y,
    position as 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w',
    props.cropData,
  )
}

/**
 * Handle resize drag
 */
const handleResize = (stagePos: { x: number; y: number }) => {
  const newCrop = cropTransform.updateResize(stagePos.x, stagePos.y, {
    imageDimensions: props.imageDimensions,
    frameSize: props.frameSize,
  })

  if (newCrop) {
    emit('crop-change', newCrop)
  }
}

/**
 * Handle resize end
 */
const handleResizeEnd = () => {
  cropTransform.endDragResize()
}
</script>
