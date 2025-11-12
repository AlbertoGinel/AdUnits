<template>
  <!-- Pure ad unit rendering at 0,0 - no frame, no positioning -->
  <v-group>
    <template v-for="(element, elementId) in adUnitElements" :key="elementId">
      <!-- Text Elements -->
      <v-text
        v-if="element.type === 'text'"
        :config="{
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          fontStyle: element.fontStyle,
          align: element.align,
          verticalAlign: element.verticalAlign,
          wrap: element.wrap,
        }"
      />

      <!-- Rectangle Elements -->
      <v-rect
        v-else-if="element.type === 'rect'"
        :config="{
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fill: element.fill,
          cornerRadius: element.cornerRadius,
          stroke: element.strokeColor,
          strokeWidth: element.strokeWidth,
        }"
      />

      <!-- Image Elements -->
      <v-image
        v-else-if="element.type === 'image'"
        :config="{
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          image: getLoadedImage(),
          fill: '#888888',
        }"
      />
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'

// ✅ Props - receives AdUnit, renders at 0,0
interface Props {
  adUnit: AdUnit
}

const props = defineProps<Props>()

// ✅ Computed optimization - only recalculate when adUnit elements change
const adUnitElements = computed(() => {
  return Object.values(props.adUnit.elements)
})

// ✅ Simple image getter (for now just return null - will improve later)
const getLoadedImage = (): HTMLImageElement | null => {
  // TODO: Connect to image loading system
  return null
}
</script>
