<template>
  <!-- Pure ad unit rendering at 0,0 - no frame, no positioning -->
  <v-group>
    <template v-for="elementData in renderableElements" :key="elementData.elementId">
      <!-- Text Elements: headline, subhead, cta, disclaimer -->
      <v-text
        v-if="isTextElement(elementData.element) && elementData.visible"
        :config="elementData.config"
      />

      <!-- Rectangle Elements: cta-background, disclaimerBG -->
      <v-rect
        v-else-if="isRectElement(elementData.element) && elementData.visible"
        :config="elementData.config"
      />

      <!-- Image Elements: logo, image, background -->
      <v-image
        v-else-if="isImageElement(elementData.element) && elementData.visible"
        :config="elementData.config"
      />
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdUnitRendering } from '@/features/stage/composables/useAdUnitRendering'
import { isTextElement, isImageElement, isRectElement } from '@/types/adUnitElementTypes'

interface Props {
  adUnitId: string
}

const props = defineProps<Props>()
const rendering = useAdUnitRendering()

// Get all renderable elements (all logic in composable)
const renderableElements = computed(() => {
  const elements = rendering.getAdUnitRenderableElements(props.adUnitId)
  return elements
})
</script>
