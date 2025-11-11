<template>
  <div class="edit-canvas">
    <v-stage :config="editStageConfig" :key="renderKey">
      <v-layer>
        <!-- Show ONLY current ad unit elements (repositioned) -->
        <template v-for="(element, elementId) in adUnit?.elements || {}" :key="elementId">
          <template v-if="shouldShowElement(String(elementId))">
            <KonvaRect
              v-if="element.type === 'rect'"
              :element="{ ...adjustElementPosition(element), id: String(elementId) }"
            />
            <KonvaImage
              v-else-if="element.type === 'image'"
              :element="{ ...adjustElementPosition(element), id: String(elementId) }"
            />
            <KonvaButton
              v-else-if="element.type === 'button'"
              :element="{ ...adjustElementPosition(element), id: String(elementId) }"
            />
            <KonvaText
              v-else-if="element.type === 'text'"
              :element="{ ...adjustElementPosition(element), id: String(elementId) }"
            />
          </template>
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { KonvaText, KonvaRect, KonvaImage } from '@/components/konvaComponents'
import KonvaButton from '@/components/konvaComponents/KonvaButton.vue'
import type { AdUnit, CanvasElement } from '@/stores/canvas'

interface Props {
  adUnit: AdUnit
}

const props = defineProps<Props>()

const renderKey = ref(0)

// ✅ Filter out frame elements (title, edit button) and reposition for edit mode
// Helper function to check if element should be shown in edit mode
const shouldShowElement = (elementId: string) => {
  return !elementId.includes('-title') && !elementId.includes('-edit-button')
}

// Helper function to adjust element position for edit mode
const adjustElementPosition = (element: CanvasElement) => {
  const framePos = props.adUnit.frameConfig.position
  return {
    ...element,
    x: element.x - framePos.x, // Adjust to relative positioning
    y: element.y - framePos.y - 16, // Account for frame title offset
  }
}

// ✅ Canvas size matches ad unit dimensions exactly
const editStageConfig = computed(() => ({
  width: props.adUnit.frameConfig.dimensions.width,
  height: props.adUnit.frameConfig.dimensions.height,
}))

onMounted(() => {
  renderKey.value++
  console.log(
    `🎯 Focus mode: Editing "${props.adUnit.title}" (${Object.keys(props.adUnit.elements).length} elements)`,
  )
  console.log(`📏 Canvas size: ${editStageConfig.value.width}×${editStageConfig.value.height}`)
  console.log('📋 Using existing canvas data - no reload needed')
})
</script>

<style scoped>
.edit-canvas {
  border: 2px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background: #b5b5b5;
}
</style>
