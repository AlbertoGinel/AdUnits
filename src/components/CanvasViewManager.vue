<template>
  <div class="canvas-view-manager">
    <!-- Simple header - only shows breadcrumb when in focus mode -->
    <div class="canvas-header" v-if="currentView === 'focusMode'">
      <div class="breadcrumb">
        <button @click="switchToBulkMode" class="back-btn">← Back to Bulk Mode</button>
        <span class="separator">→</span>
        <span class="current-unit">🎯 {{ currentAdUnit?.title }}</span>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="canvas-area">
      <!-- Bulk Mode: All Ad Units -->
      <BulkModeCanvas v-if="currentView === 'bulkMode'" />

      <!-- Focus Mode: Single Ad Unit -->
      <FocusModeCanvas
        v-else-if="currentView === 'focusMode' && currentAdUnit"
        :ad-unit="currentAdUnit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'
import BulkModeCanvas from './BulkModeCanvas.vue'
import FocusModeCanvas from './FocusModeCanvas.vue'

const canvasStore = useCanvasStore()
const { getCurrentAdUnit, switchToBulkMode } = canvasStore
const { currentView } = storeToRefs(canvasStore)

const currentAdUnit = computed(() => getCurrentAdUnit())

console.log('🎛️ CanvasViewManager mounted')
</script>

<style scoped>
.canvas-view-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.canvas-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-btn {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #007bff;
  color: white;
}

.view-btn.active {
  background: #007bff;
  color: white;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.separator {
  color: #6c757d;
}

.current-unit {
  font-weight: 500;
  color: #007bff;
}

.back-btn {
  padding: 4px 8px;
  border: 1px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.back-btn:hover {
  background: #6c757d;
  color: white;
}

.ad-unit-selector select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.canvas-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
