<template>
  <CanvasScreenSkeleton v-if="!bundleReady" />

  <div
    v-else
    ref="containerRef"
    class="canvas-screen"
    :style="{ backgroundColor: stage.backgroundColor.value }"
  >
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
import { ref, computed, watch, nextTick } from 'vue'
import { useViewState } from '@/features/stage/composables/useViewState'
import { useKonvaStage } from '@/features/stage/composables/useKonvaStage'
import { useSuspenseManager } from '@/features/feedbackAsync/useSuspenseManager'
import BulkModeView from './BulkModeView.vue'
import FocusModeView from './FocusModeView.vue'
import CanvasScreenSkeleton from './CanvasScreenSkeleton.vue'

// Pure reactive state
const suspenseManager = useSuspenseManager()
const bundleReady = computed(() => suspenseManager.bundleReady.value)
const containerRef = ref<HTMLElement | null>(null)

// Stage controller (DOM-dependent)
const stage = useKonvaStage(containerRef)

// View state management (singleton)
const viewState = useViewState()

// Smart coordination: Single watch for all view changes
watch(
  [() => viewState.viewMode.value, () => viewState.currentAdUnitId.value],
  ([newMode, newAdUnitId], [oldMode, oldAdUnitId]) => {
    nextTick(() => {
      // Trigger zoom on view mode change or ad unit change in focus mode
      if (newMode === 'bulkMode' && newMode !== oldMode) {
        console.log('🔄 View changed to bulk - triggering zoomToFit')
        stage.zoomToFit()
      } else if (newMode === 'focusMode' && newAdUnitId && newAdUnitId !== oldAdUnitId) {
        console.log(`🎯 View changed to focus (${newAdUnitId}) - triggering zoomToFit`)
        stage.zoomToFit()
      }
    })
  },
  { immediate: true },
)

// Clean version - no debug logs
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
