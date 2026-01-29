<template>
  <v-rect
    :config="{
      x: x,
      y: y,
      width: 8,
      height: 8,
      fill: '#ff6b35',
      stroke: '#ffffff',
      strokeWidth: 1,
      listening: true,
      draggable: true,
    }"
    @dragstart="handleDragStart"
    @dragmove="handleDragMove"
    @dragend="handleDragEnd"
  />
</template>

<script setup lang="ts">
import type Konva from 'konva'

interface Props {
  x: number
  y: number
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w'
}

interface Emits {
  (e: 'drag-start', position: string, stagePos: { x: number; y: number }): void
  (e: 'drag', stagePos: { x: number; y: number }): void
  (e: 'drag-end'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
  const pos = e.target.getStage()?.getPointerPosition()
  if (pos) {
    emit('drag-start', props.position, pos)
  }
}

const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
  const pos = e.target.getStage()?.getPointerPosition()
  if (pos) {
    emit('drag', pos)
  }
}

const handleDragEnd = () => {
  emit('drag-end')
}
</script>
