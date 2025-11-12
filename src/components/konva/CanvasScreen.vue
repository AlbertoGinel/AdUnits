<template>
  <div class="canvas-screen">
    <v-stage :config="stageConfig" class="main-stage">
      <v-layer>
        <BulkModeView v-if="viewMode === 'bulkMode'" />
        <FocusModeView v-else-if="viewMode === 'focusMode'" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasManager } from '@/composables/view/useCanvasManager'
import BulkModeView from '@/components/konva/BulkModeView.vue'
import FocusModeView from '@/components/konva/FocusModeView.vue'

const canvasManager = useCanvasManager()
const viewMode = computed(() => canvasManager.viewMode.value)

const stageConfig = computed(() => {
  if (viewMode.value === 'bulkMode') {
    return {
      width: 1200,
      height: 800,
      scaleX: 1,
      scaleY: 1,
      x: 0.5,
      y: 25,
      pixelRatio: 10,
    }
  } else {
    return {
      width: 600,
      height: 400,
      scaleX: 1,
      scaleY: 1,
      x: 0.5,
      y: 25,
      pixelRatio: 4,
    }
  }
})
</script>

<style scoped>
.canvas-screen {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* Main stage styling removed to fix positioning offset */
</style>
