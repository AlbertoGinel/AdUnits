<template>
  <div class="creative-konva-canvas-container">
    <div class="canvas-header">
      <h3>{{ adUnitGroup?.name || 'AdUnit Group' }}</h3>
      <div class="canvas-controls">
        <button @click="fitToScreen" class="control-btn">Fit to Screen</button>
        <button @click="resetZoom" class="control-btn">Reset Zoom</button>
        <span class="zoom-level">{{ Math.round(currentScale * 100) }}%</span>
      </div>
    </div>

    <!-- Canvas container for AdUnitsCanvasService -->
    <div class="canvas-wrapper" ref="canvasContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useAdUnitsStore } from '@/stores/adUnits'
import { AdUnitsCanvasService } from '@/services/canvas/AdUnitsCanvasService'
import { useDevLogger } from '@/devTools/useDevLogger'

const adUnitsStore = useAdUnitsStore()
const canvasService = new AdUnitsCanvasService()
const devLogger = useDevLogger('CreativeKonvaCanvas')

// Initialize store
adUnitsStore.initializeStore()

// Reactive references
const canvasContainer = ref<HTMLDivElement>()

// Computed properties
const adUnitGroup = computed(() => adUnitsStore.adUnitGroup)

// Get scale from AdUnitsCanvasService for display
const currentScale = computed(() => {
  const stage = canvasService.getStage()
  return stage ? stage.scaleX() : 1
})

// Canvas controls
const fitToScreen = () => {
  devLogger.component('Fit to screen clicked')
  canvasService.fitToScreen()
}

const resetZoom = () => {
  devLogger.component('Reset zoom clicked')
  canvasService.resetZoom()
}

// Lifecycle
onMounted(() => {
  // Initialize AdUnitsCanvasService
  nextTick(() => {
    if (canvasContainer.value) {
      devLogger.component('Initializing AdUnits canvas service...')
      canvasService.initializeCanvas(canvasContainer.value)

      // Render AdUnit group if available
      if (adUnitGroup.value) {
        devLogger.component('Rendering initial AdUnit group...')
        canvasService.renderAdUnitGroup(adUnitGroup.value)
      }
    }
  })
})

// Cleanup on component unmount
onUnmounted(() => {
  devLogger.component('Cleaning up component...')
  canvasService.destroy()
})

// Optimized watch - watch for AdUnit group changes
watch(
  () => adUnitGroup.value,
  (newAdUnitGroup) => {
    if (newAdUnitGroup && canvasContainer.value) {
      devLogger.component('AdUnit group changed, updating canvas...')
      canvasService.renderAdUnitGroup(newAdUnitGroup)
    }
  },
  { deep: true },
)
</script>

<style scoped>
.creative-konva-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.canvas-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.canvas-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: #e0e0e0;
}

.zoom-level {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.canvas-wrapper {
  flex: 1;
  overflow: hidden;
  cursor: grab;
}

.canvas-wrapper:active {
  cursor: grabbing;
}
</style>
