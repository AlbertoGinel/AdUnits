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
import type { AdUnit } from '@/types/mainTypes'
import AdUnitComponent from './AdUnit.vue'
import { useAppStore } from '@/data/stores/useAppStore'
import { useViewState } from '@/features/stage/composables/useViewState'

// ✅ Props
interface Props {
  adUnit: AdUnit
  position: { x: number; y: number }
}

const props = defineProps<Props>()
const appStore = useAppStore()
const viewState = useViewState()

// Check if cropping mode is active
const isCropping = computed(() => false) // TODO: implement cropping state

// ✅ Title configuration
const titleConfig = computed(() => ({
  x: 5,
  y: 10,
  text: props.adUnit.frameConfig.title,
  fontSize: 20,
  fontFamily: 'var(--font-family-primary)',
  fill: 'var(--color-text-primary)',
  fontStyle: 'bold',
}))

// ✅ Edit button - conditional text based on view mode
const editButtonConfig = computed(() => {
  const isInFocusMode = viewState.isFocusMode.value

  return {
    x: 135,
    y: 10,
    text: isInFocusMode ? 'Back' : 'Edit',
    fontSize: 12,
    fontFamily: 'var(--font-family-primary)',
    fill: 'var(--color-primary)',
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
    appStore.setCurrentView('bulkMode')
    appStore.setCurrentAdUnitId(null)
  } else {
    appStore.setCurrentView('focusMode')
    appStore.setCurrentAdUnitId(props.adUnit.id)
  }
}
</script>

<style scoped>
/* CSS Variables for consistent styling */
:root {
  --font-family-primary: 'Everyday Sans', 'Arial', sans-serif;
  --color-text-primary: #333333;
  --color-primary: #007bff;
  --color-background: #ffffff;
  --border-radius: 4px;
  --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Frame container styles */
.frame-container {
  font-family: var(--font-family-primary);
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

/* Title text styles */
.frame-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
}

/* Edit button styles */
.edit-button {
  font-size: 12px;
  color: var(--color-primary);
  font-family: var(--font-family-primary);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.edit-button:hover {
  opacity: 0.8;
}

/* Content area styles */
.content-area {
  position: relative;
  overflow: hidden;
}
</style>
