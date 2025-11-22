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
import { useViewState } from '@/composables/view/useViewState'
import FramedAdUnit from '@/components/konva/FramedAdUnit.vue'

const viewState = useViewState()

// ✅ Get the currently focused ad unit
const currentAdUnit = computed(() => viewState.currentAdUnit.value)

// ✅ Handle frame click - switch back to bulk mode
const handleFrameClick = () => {
  viewState.switchToBulkMode()
}
</script>
