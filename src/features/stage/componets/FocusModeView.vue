<template>
  <!-- Renders single FramedAdUnit centered, others hidden -->
  <v-group>
    <!-- Normal focus view -->
    <FramedAdUnit
      v-if="currentAdUnit && !cropState.isCropActive.value"
      :key="currentAdUnit.id"
      :ad-unit="currentAdUnit"
      :position="{ x: 0, y: 30 }"
      :is-focused="true"
      @frame-click="handleFrameClick"
    />

    <!-- Simple crop view -->
    <CropView v-if="currentAdUnit && !!cropState.isCropActive.value" />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useViewState } from '@/features/stage/composables/useViewState'
import { useCropState } from '@/features/crop/composables/useCropState'
import FramedAdUnit from './FramedAdUnit.vue'
import CropView from '@/features/crop/components/useView.vue'

const viewState = useViewState()
const cropState = useCropState()

// ✅ Get the currently focused ad unitcl
const currentAdUnit = computed(() => viewState.currentAdUnit.value)

// ✅ Handle frame click - switch back to bulk mode
const handleFrameClick = () => {
  viewState.switchToBulkMode()
}
</script>
