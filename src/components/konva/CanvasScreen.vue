<template>
  <CanvasScreenSkeleton v-if="!bundleReady" />

  <div v-else ref="containerRef" class="canvas-screen">
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
import { ref, computed } from 'vue'
import { useViewState } from '@/composables/view/useViewState'
import { useKonvaStage } from '@/composables/view/useKonvaStage'
import { useTools } from '@/composables/Tools/useTools'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import BulkModeView from '@/components/konva/BulkModeView.vue'
import FocusModeView from '@/components/konva/FocusModeView.vue'
import CanvasScreenSkeleton from './CanvasScreenSkeleton.vue'

// Pure reactive state
const suspenseManager = useSuspenseManager()
const bundleReady = computed(() => suspenseManager.bundleReady.value)
const containerRef = ref<HTMLElement | null>(null)
const viewState = useViewState()

// Stage controller (pure computed, no observers)
const stage = useKonvaStage(containerRef, bundleReady)

// Clean version - no debug logs

// Tools setup (one-time)
const tools = useTools()
tools.setOnModeChange((mode, id) => {
  if (mode === 'bulkMode') {
    stage.zoomToFit()
  } else if (mode === 'focusMode' && id) {
    stage.zoomToAdUnit(id)
  }
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
