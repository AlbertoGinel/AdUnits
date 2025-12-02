<template>
  <CanvasScreenSkeleton v-if="suspenseState.isLoading" />

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
import { useTools } from '@/composables/Tools/useTools'
import BulkModeView from '@/components/konva/BulkModeView.vue'
import FocusModeView from '@/components/konva/FocusModeView.vue'
import CanvasScreenSkeleton from './CanvasScreenSkeleton.vue'
import { useErrorHandler } from '@/composables/errors/useErrorHandler'

// Error handler for suspense state
const { suspenseState } = useErrorHandler()

const containerRef = ref<HTMLElement | null>(null)
const viewState = useViewState()
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
