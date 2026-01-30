<template>
  <!-- Pure ad unit rendering at 0,0 - no frame, no positioning -->
  <v-group>
    <template v-for="renderData in renderableElements" :key="renderData.id">
      <!-- Text Elements -->
      <v-text
        v-if="isTextElement(renderData.element) && renderData.visible"
        :config="renderData.config"
      />

      <!-- Rectangle Elements -->
      <v-rect
        v-else-if="isRectElement(renderData.element) && renderData.visible"
        :config="renderData.config"
      />

      <!-- Image elements: Smart switching -->
      <template v-else-if="isImageElement(renderData.element) && renderData.visible">
        <!-- Debug info -->
        {{
          console.log('🖼️ Image element debug:', {
            hasImageUrl: renderData.hasImageUrl,
            isLoaded: renderData.isLoaded,
            isCropActive: isCropActive,
            renderData: renderData,
          })
        }}

        <!-- Case 1: No URL available → Gray rectangle -->
        <v-rect v-if="!renderData.hasImageUrl" :config="getGrayRectConfig(renderData)" />

        <!-- Case 2: URL available but not loaded → Shimmer skeleton -->
        <v-rect v-else-if="!renderData.isLoaded" :config="getShimmerConfig(renderData)" />

        <!-- Case 3: Loaded → Normal image OR Crop mode -->
        <template v-else>
          <!-- Crop mode: Keep original image invisible + show CropView -->
          <template v-if="isCropActive && renderData.id === 'image'">
            <!-- Original image - invisible but still reactive to zoom/pan -->
            <v-image :config="{ ...renderData.config, opacity: 0 }" />
            <!-- Crop overlay -->
            <CropView :renderData="renderData" />
          </template>

          <!-- Normal mode: Everything renders as v-image -->
          <v-image v-else :config="renderData.config" />
        </template>
      </template>
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRendering } from '@/features/stage/composables/useRendering'
import { useCropState } from '@/features/crop/composables/useCropState'
import { isTextElement, isImageElement, isRectElement } from '@/types/adUnitElementTypes'
import type { RenderableElement } from '@/features/stage/composables/useRendering'
import CropView from '@/features/crop/components/CropView.vue'

interface Props {
  adUnitID: string
}

const props = defineProps<Props>()

const rendering = useRendering()
const cropState = useCropState()

// Separate computed for crop state to ensure template reactivity
const isCropActive = computed(() => cropState.isCropActive.value)

console.log(
  '🚀 AdUnit setup for adUnit:',
  props.adUnitID,
  'Crop state:',
  cropState.isCropActive.value,
)

// Get all renderable elements (ordered, with configs, visibility handled)
// This should be reactive to loading state changes
const renderableElements = computed(() => {
  // Make computed depend on crop state for reactivity
  const cropActive = isCropActive.value

  console.log('🔄 renderableElements recomputing - crop state:', cropActive)

  const elements = rendering.getRenderableElements(props.adUnitID)

  // Trigger async loading for any images that have URLs but aren't loaded
  elements.forEach((element) => {
    if (isImageElement(element.element) && element.hasImageUrl && !element.isLoaded) {
      // Trigger loading asynchronously (don't await to keep computed sync)
      rendering.getImageForRendering(element.element.imageID).catch(console.error)
    }
  })

  return elements
})

// Gray rectangle config for missing images (no URL)
const getGrayRectConfig = (renderData: RenderableElement) => ({
  x: renderData.config.x,
  y: renderData.config.y,
  width: renderData.config.width,
  height: renderData.config.height,
  fill: '#e0e0e0',
  strokeWidth: 0,
  cornerRadius: 0,
})

// Shimmer skeleton config for loading images
const getShimmerConfig = (renderData: RenderableElement) => ({
  x: renderData.config.x,
  y: renderData.config.y,
  width: renderData.config.width,
  height: renderData.config.height,
  fill: '#f0f0f0',
  stroke: '#e0e0e0',
  strokeWidth: 1,
  cornerRadius: 4,
  opacity: 0.8,
  // Note: Konva doesn't support CSS animations, so this is a static shimmer color
  // For actual shimmer effect, you'd need to implement with Konva animations
})
</script>
