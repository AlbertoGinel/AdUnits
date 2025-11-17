<template>
  <!-- Frame with title, edit button, and AdUnit content -->
  <v-group :config="{ x: position.x, y: position.y }">
    <!-- Ad Unit Frame Background -->

    <!-- Frame Title -->
    <v-text :config="titleConfig" />

    <!-- Edit Button -->
    <v-text :config="editButtonConfig" @click="handleEditClick" />

    <!-- AdUnit Content (positioned with contentOffset) -->
    <v-group :config="contentGroupConfig">
      <AdUnitComponent :ad-unit="adUnit" />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'
import AdUnitComponent from '@/components/konva/AdUnit.vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasManager } from '@/composables/view/useCanvasManager'

// ✅ Props
interface Props {
  adUnit: AdUnit
  position: { x: number; y: number }
}

const props = defineProps<Props>()
const { switchMode } = useTools()
const canvasManager = useCanvasManager()

// ✅ Title configuration
const titleConfig = computed(() => ({
  x: 8,
  y: -20,
  text: props.adUnit.frameConfig.title,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fill: '#333',
  fontStyle: 'bold',
}))

// ✅ Edit button - conditional text based on view mode
const editButtonConfig = computed(() => {
  const offset = props.adUnit.frameConfig.editButtonOffset || { x: -60, y: -25 }
  const isInFocusMode = canvasManager.viewMode.value === 'focusMode'

  return {
    x: props.adUnit.frameConfig.dimensions.width + offset.x,
    y: offset.y,
    text: isInFocusMode ? 'Back' : 'Edit',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fill: '#007bff',
  }
})

// ✅ Content group positioning using contentOffset
const contentGroupConfig = computed(() => ({
  x: props.adUnit.frameConfig.contentOffset.x,
  y: props.adUnit.frameConfig.contentOffset.y,
}))

// ✅ Handle edit button click - conditional behavior based on current mode
const handleEditClick = () => {
  const isInFocusMode = canvasManager.viewMode.value === 'focusMode'

  if (isInFocusMode) {
    // Switch back to bulk mode
    switchMode('bulkMode', null)
  } else {
    // Switch to focus mode for this ad unit
    switchMode('focusMode', props.adUnit.id)
  }
}
</script>
