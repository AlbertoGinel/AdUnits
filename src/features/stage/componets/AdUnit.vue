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

      <!-- Image Elements -->
      <v-image
        v-else-if="isImageElement(renderData.element) && renderData.visible"
        :config="renderData.config"
      />
    </template>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRendering } from '@/features/stage/composables/useRendering'
import { isTextElement, isImageElement, isRectElement } from '@/types/adUnitElementTypes'

interface Props {
  adUnitID: string
}

const props = defineProps<Props>()

const rendering = useRendering()

// Get all renderable elements (ordered, with configs, visibility handled)
const renderableElements = computed(() => rendering.getRenderableElements(props.adUnitID))
</script>
