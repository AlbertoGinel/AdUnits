<template>
  <div v-if="shouldShow" class="locked-info">
    <p class="locked-message">
      <span class="locked-icon">🔒</span>
      {{ messageText }}
    </p>
    <button @click="handleUnlock" class="override-button" type="button">Override All</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useAppStore } from '@/data/stores/useAppStore'
import { useFieldService } from '@/data/services/useFieldService'
import type { EditableElementType, EditablePropertiesOf } from '@/types/mainTypes'

// Props
const props = defineProps<{
  elementKey: EditableElementType
  property: string
}>()

// Stores & Services
const adUnitStore = useAdUnitStore()
const appStore = useAppStore()
const fieldService = useFieldService()

// Get locked AdUnits for this property
const lockedAdUnits = computed(() => {
  return adUnitStore.getAdUnitsByPropertyLock(
    props.elementKey,
    props.property as EditablePropertiesOf<typeof props.elementKey>,
    true,
  )
})

// Show component only if there are locked AdUnits
const shouldShow = computed(() => {
  return appStore.isBulkMode() && lockedAdUnits.value.length > 0
})

// Message text with full AdUnit IDs
const messageText = computed(() => {
  const ids = lockedAdUnits.value.join(', ')
  return `Does not apply on: ${ids}`
})

// Override: unlock all and cascade layer value
const handleUnlock = () => {
  fieldService.overrideLockedAdUnits(
    props.elementKey,
    props.property as EditablePropertiesOf<typeof props.elementKey>,
  )
}
</script>

<style scoped>
/* Locked info styles */
.locked-info {
  margin: 2px 0 4px 0;
  padding: 4px 6px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 3px;
}

.locked-message {
  margin: 0 0 8px 0;
  font-size: 10px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 3px;
}

.locked-icon {
  font-size: 14px;
}

.override-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.override-button:hover {
  background-color: #0056b3;
}

.override-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
}
</style>
