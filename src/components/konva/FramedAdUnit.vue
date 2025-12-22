<template>
  <!-- Frame with title, edit button, and AdUnit content -->
  <v-group :config="{ x: position.x, y: position.y }">
    <!-- Ad Unit Frame Background -->

    <!-- Frame Title - hidden during cropping -->
    <v-text v-if="!isCropping" :config="titleConfig" />

    <!-- Edit Button - hidden during cropping -->
    <v-text v-if="!isCropping" :config="editButtonConfig" @click="handleEditClick" />

    <!-- AdUnit Content (positioned with contentOffset) -->
    <v-group :config="contentGroupConfig">
      <AdUnitComponent :ad-unit-id="adUnit.id" />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'
import AdUnitComponent from '@/components/konva/AdUnit.vue'
import { useTools } from '@/composables/Tools/useTools'
import { useViewState } from '@/composables/view/useViewState'
import { useCropping } from '@/composables/Tools/useCropping'

// ✅ Props
interface Props {
  adUnit: AdUnit
  position: { x: number; y: number }
}

const props = defineProps<Props>()
const { switchToBulkMode, switchToFocusMode } = useTools()
const viewState = useViewState()
const { isCropping } = useCropping()

// ✅ Title configuration
const titleConfig = computed(() => ({
  x: 5,
  y: 10,
  text: props.adUnit.frameConfig.title,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fill: '#333',
  fontStyle: 'bold',
}))

// ✅ Edit button - conditional text based on view mode
const editButtonConfig = computed(() => {
  //const offset = props.adUnit.frameConfig.editButtonOffset || { x: -60, y: -25 }
  const isInFocusMode = viewState.isFocusMode.value

  return {
    x: 200,
    y: 10,
    text: isInFocusMode ? 'Back' : 'Edit',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fill: '#007bff',
  }
})

// ✅ Content group positioning using contentOffset
const contentGroupConfig = computed(() => ({
  x: props.adUnit.frameConfig.contentOffset.x,
  y: props.adUnit.frameConfig.contentOffset.y,
}))

const handleEditClick = () => {
  const isInFocusMode = viewState.isFocusMode.value

  if (isInFocusMode) {
    switchToBulkMode()
  } else {
    switchToFocusMode(props.adUnit.id)
  }
}
</script>
