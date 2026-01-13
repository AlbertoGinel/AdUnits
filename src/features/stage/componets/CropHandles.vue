<!-- components/konva/CropHandles.vue -->
<template>
  <v-group>
    <!-- Crop border with dashed line -->
    <v-rect
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: visibleArea.width,
        height: visibleArea.height,
        stroke: '#00aaff',
        strokeWidth: 3,
        dash: [10, 5],
        listening: false,
      }"
    />

    <!-- Drag area (for panning the crop) -->
    <v-rect
      :config="{
        x: visibleArea.x,
        y: visibleArea.y,
        width: visibleArea.width,
        height: visibleArea.height,
        fill: 'transparent',
        draggable: true,
      }"
      @dragmove="handlePan"
      @dragend="handleDragEnd"
    />

    <!-- Corner resize handles (4 corners) -->
    <v-circle
      v-for="corner in corners"
      :key="corner.name"
      :config="{
        x: corner.x,
        y: corner.y,
        radius: 10,
        fill: 'white',
        stroke: '#00aaff',
        strokeWidth: 3,
        draggable: true,
        name: corner.name,
      }"
      @dragmove="(e: KonvaEventObject<DragEvent>) => handleCornerDrag(e, corner.name)"
      @dragend="handleDragEnd"
    />

    <!-- Edge resize handles (4 edges) -->
    <v-rect
      v-for="edge in edges"
      :key="edge.name"
      :config="{
        x: edge.x,
        y: edge.y,
        width: edge.width,
        height: edge.height,
        fill: 'white',
        stroke: '#00aaff',
        strokeWidth: 2,
        draggable: true,
        name: edge.name,
      }"
      @dragmove="(e: KonvaEventObject<DragEvent>) => handleEdgeDrag(e, edge.name)"
      @dragend="handleDragEnd"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'

interface Props {
  visibleArea: { x: number; y: number; width: number; height: number }
  cropData: { x: number; y: number; width: number; height: number }
  originalDimensions: { naturalWidth: number; naturalHeight: number }
  aspectRatio: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateCrop: [crop: { x?: number; y?: number; width?: number; height?: number }]
  dragCrop: [delta: { x: number; y: number }]
}>()

// Calculate positions for 4 corner handles
const corners = computed(() => [
  {
    name: 'nw',
    x: props.visibleArea.x,
    y: props.visibleArea.y,
  },
  {
    name: 'ne',
    x: props.visibleArea.x + props.visibleArea.width,
    y: props.visibleArea.y,
  },
  {
    name: 'se',
    x: props.visibleArea.x + props.visibleArea.width,
    y: props.visibleArea.y + props.visibleArea.height,
  },
  {
    name: 'sw',
    x: props.visibleArea.x,
    y: props.visibleArea.y + props.visibleArea.height,
  },
])

// Calculate positions for 4 edge handles
const edges = computed(() => {
  const handleSize = 8
  return [
    {
      name: 'n',
      x: props.visibleArea.x + props.visibleArea.width / 2 - handleSize / 2,
      y: props.visibleArea.y - handleSize / 2,
      width: handleSize,
      height: handleSize,
    },
    {
      name: 'e',
      x: props.visibleArea.x + props.visibleArea.width - handleSize / 2,
      y: props.visibleArea.y + props.visibleArea.height / 2 - handleSize / 2,
      width: handleSize,
      height: handleSize,
    },
    {
      name: 's',
      x: props.visibleArea.x + props.visibleArea.width / 2 - handleSize / 2,
      y: props.visibleArea.y + props.visibleArea.height - handleSize / 2,
      width: handleSize,
      height: handleSize,
    },
    {
      name: 'w',
      x: props.visibleArea.x - handleSize / 2,
      y: props.visibleArea.y + props.visibleArea.height / 2 - handleSize / 2,
      width: handleSize,
      height: handleSize,
    },
  ]
})

// Handle panning the entire crop area
const handlePan = (e: KonvaEventObject<DragEvent>) => {
  const node = e.target as Konva.Rect
  const newX = node.x()
  const newY = node.y()

  // Calculate delta in canvas space
  const deltaX = newX - props.visibleArea.x
  const deltaY = newY - props.visibleArea.y

  // Convert to original image space
  const scaleX = props.cropData.width / props.visibleArea.width
  const scaleY = props.cropData.height / props.visibleArea.height

  emit('dragCrop', {
    x: deltaX * scaleX,
    y: deltaY * scaleY,
  })

  // Reset position (we handle it via emit)
  node.position({ x: props.visibleArea.x, y: props.visibleArea.y })
}

// Handle corner drag (resize maintaining aspect ratio)
const handleCornerDrag = (e: KonvaEventObject<DragEvent>, cornerName: string) => {
  const node = e.target as Konva.Circle
  const newX = node.x()
  const newY = node.y()

  // Calculate new crop dimensions based on corner being dragged
  // This is complex - need to maintain aspect ratio and constrain to bounds
  // For now, placeholder logic

  console.log('Corner drag:', cornerName, newX, newY)

  // Reset position
  const corner = corners.value.find((c) => c.name === cornerName)
  if (corner) {
    node.position({ x: corner.x, y: corner.y })
  }
}

// Handle edge drag (resize maintaining aspect ratio)
const handleEdgeDrag = (e: KonvaEventObject<DragEvent>, edgeName: string) => {
  const node = e.target as Konva.Rect
  const newX = node.x()
  const newY = node.y()

  console.log('Edge drag:', edgeName, newX, newY)

  // Reset position
  const edge = edges.value.find((e) => e.name === edgeName)
  if (edge) {
    node.position({ x: edge.x, y: edge.y })
  }
}

const handleDragEnd = () => {
  // Snap to grid or apply final constraints if needed
}
</script>
