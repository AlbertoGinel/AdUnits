<template>
  <div ref="containerRef" class="canvas-screen">
    <v-stage
      :config="stage.stageConfig.value"
      class="main-stage"
      @wheel="stage.handleWheel"
      @mousedown="stage.handleMouseDown"
      @mousemove="stage.handleMouseMove"
      @mouseup="stage.handleMouseUp"
    >
      <v-layer>
        <!-- Debug: Stage bounds -->
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: canvasStore.stage.width,
            height: canvasStore.stage.height,
            stroke: 'red',
            strokeWidth: 0,
            listening: false,
          }"
        />

        <!-- Content -->
        <BulkModeView v-if="viewState.isBulkMode.value" />
        <FocusModeView v-else-if="viewState.isFocusMode.value" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useViewState } from '@/composables/view/useViewState'
import { useKonvaStage } from '@/composables/view/useKonvaStage'
import { useCanvasStore } from '@/stores/canvas'
import { useTools } from '@/composables/Tools/useTools'
import BulkModeView from '@/components/konva/BulkModeView.vue'
import FocusModeView from '@/components/konva/FocusModeView.vue'

const containerRef = ref<HTMLElement | null>(null)
const viewState = useViewState()
const canvasStore = useCanvasStore()
const stage = useKonvaStage(containerRef)
const tools = useTools()

// Setup zoom callback when mode changes
onMounted(() => {
  console.log('🔧 Registering zoom callback')
  tools.setOnModeChange((mode, id) => {
    console.log('📢 Mode changed:', mode, id)

    if (mode === 'bulkMode') {
      console.log('→ Calling zoomToFit()')
      stage.zoomToFit()
    } else if (mode === 'focusMode' && id) {
      console.log('→ Calling zoomToAdUnit(', id, ')')
      stage.zoomToAdUnit(id)
    }
  })
})
</script>

<style scoped>
.canvas-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 0px solid blue;
  box-sizing: border-box;
  position: relative;
}

.main-stage {
  width: 100%;
  height: 100%;
}
</style>
