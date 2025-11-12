<template>
  <!-- Renders single FramedAdUnit centered, others hidden -->
  <v-group>
    <FramedAdUnit
      v-if="currentAdUnit"
      :key="currentAdUnit.id"
      :ad-unit="currentAdUnit"
      :position="{ x: 50, y: 50 }"
      :is-focused="true"
      @frame-click="handleFrameClick"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasManager } from '@/composables/view/useCanvasManager'
import FramedAdUnit from '@/components/konva/FramedAdUnit.vue'

const canvasManager = useCanvasManager()

// ✅ Computed optimization - only recalculate when current ad unit changes
const currentAdUnit = computed(() => canvasManager.getCurrentAdUnit())

// ✅ Handle frame click - could switch back to bulk mode or do nothing
const handleFrameClick = () => {
  // Focus mode - maybe do nothing or switch back to bulk
  canvasManager.switchToBulkMode()
}
</script>
