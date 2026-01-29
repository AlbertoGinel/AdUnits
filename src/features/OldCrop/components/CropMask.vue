<template>
  <v-group>
    <!-- Top mask -->
    <v-rect
      v-if="cropArea.y > 0"
      :config="{
        x: 0,
        y: 0,
        width: imageDimensions.width,
        height: cropArea.y,
        fillLinearGradientStartPoint: { x: 0, y: cropArea.y },
        fillLinearGradientEndPoint: { x: 0, y: 0 },
        fillLinearGradientColorStops: [0, 'rgba(255,255,255,0)', 1, 'rgba(255,255,255,0.8)'],
        listening: false,
      }"
    />

    <!-- Bottom mask -->
    <v-rect
      v-if="cropArea.y + cropArea.height < imageDimensions.height"
      :config="{
        x: 0,
        y: cropArea.y + cropArea.height,
        width: imageDimensions.width,
        height: imageDimensions.height - (cropArea.y + cropArea.height),
        fillLinearGradientStartPoint: { x: 0, y: cropArea.y + cropArea.height },
        fillLinearGradientEndPoint: { x: 0, y: imageDimensions.height },
        fillLinearGradientColorStops: [0, 'rgba(255,255,255,0)', 1, 'rgba(255,255,255,0.8)'],
        listening: false,
      }"
    />

    <!-- Left mask -->
    <v-rect
      v-if="cropArea.x > 0"
      :config="{
        x: 0,
        y: cropArea.y,
        width: cropArea.x,
        height: cropArea.height,
        fillLinearGradientStartPoint: { x: cropArea.x, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: 0 },
        fillLinearGradientColorStops: [0, 'rgba(255,255,255,0)', 1, 'rgba(255,255,255,0.8)'],
        listening: false,
      }"
    />

    <!-- Right mask -->
    <v-rect
      v-if="cropArea.x + cropArea.width < imageDimensions.width"
      :config="{
        x: cropArea.x + cropArea.width,
        y: cropArea.y,
        width: imageDimensions.width - (cropArea.x + cropArea.width),
        height: cropArea.height,
        fillLinearGradientStartPoint: { x: cropArea.x + cropArea.width, y: 0 },
        fillLinearGradientEndPoint: { x: imageDimensions.width, y: 0 },
        fillLinearGradientColorStops: [0, 'rgba(255,255,255,0)', 1, 'rgba(255,255,255,0.8)'],
        listening: false,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import type { CropData } from '../composables/useCropMode'

interface Props {
  cropArea: CropData
  imageDimensions: { width: number; height: number }
}

defineProps<Props>()
</script>
