<template>
  <!-- Renders single FramedAdUnit centered, others hidden -->
  <v-group>
    <v-group>
      <!-- Normal focus view -->
      <FramedAdUnit
        v-if="currentAdUnit"
        :key="currentAdUnit.id"
        :ad-unit="currentAdUnit"
        :position="{ x: 0, y: 30 }"
        :is-focused="true"
        @frame-click="handleFrameClick"
      />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useViewState } from '@/features/stage/composables/useViewState'
import FramedAdUnit from './FramedAdUnit.vue'

const viewState = useViewState()

// ✅ Get the currently focused ad unitcl
const currentAdUnit = computed(() => viewState.currentAdUnit.value)

// ✅ Handle frame click - switch back to bulk mode
const handleFrameClick = () => {
  viewState.switchToBulkMode()
}
</script>
