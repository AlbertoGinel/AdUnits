<template>
  <div v-if="shouldShow" class="locked-info">
    <p class="locked-message">
      <span class="locked-icon">🔒</span>
      {{ messageText }}
    </p>
    <button @click="handleOverride" class="override-button" type="button">
      {{ labelText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'

interface TextFieldState {
  fieldName: string | ComputedRef<string>
  isBulkMode: ComputedRef<boolean>
  getCustomMessage: (type: 'text' | 'visibility' | 'bgVisibility' | 'asset') => string
  overrideAllLocked?: () => void
  // Properties that LockedInfo actually accesses based on lockType
  lockedElements?: ComputedRef<string[]>
  lockedVisibilityElements?: ComputedRef<string[]> | undefined
  lockedBgElements?: ComputedRef<string[]> | undefined
}

interface Props {
  field: TextFieldState
  lockType: 'text' | 'visibility' | 'bgVisibility' | 'asset'
}

const props = defineProps<Props>()

// Get the appropriate data based on lock type
const getLockedElements = (): ComputedRef<string[]> | undefined => {
  switch (props.lockType) {
    case 'text':
      return props.field.lockedElements
    case 'visibility':
      return props.field.lockedVisibilityElements
    case 'bgVisibility':
      return props.field.lockedBgElements
    case 'asset':
      return props.field.lockedElements // Assets use same locked elements as text
    default:
      return undefined
  }
}

const getOverrideState = () => {
  // Support both text and asset overrides with the new button approach
  if ((props.lockType === 'text' || props.lockType === 'asset') && props.field.overrideAllLocked) {
    return props.field.overrideAllLocked
  }
  return null
}

const handleOverride = () => {
  const overrideFunction = getOverrideState()
  if (overrideFunction) {
    overrideFunction()
  }
}

// Computed properties for dynamic content
const shouldShow = computed(() => {
  const lockedElements = getLockedElements()
  const elementsArray = lockedElements?.value || []
  // Show for text and asset overrides
  return (
    props.field.isBulkMode.value &&
    elementsArray.length > 0 &&
    (props.lockType === 'text' || props.lockType === 'asset')
  )
})

const messageText = computed(() => {
  const lockedElements = getLockedElements()
  const elementsArray = lockedElements?.value || []
  const customMessage = props.field.getCustomMessage(props.lockType)
  return `${customMessage} ${elementsArray.join(', ')}`
})

const labelText = computed(() => {
  const fieldName =
    typeof props.field.fieldName === 'string' ? props.field.fieldName : props.field.fieldName.value

  let actionType: string
  switch (props.lockType) {
    case 'text':
      actionType = 'text'
      break
    case 'asset':
      actionType = 'assets'
      break
    case 'visibility':
    case 'bgVisibility':
      actionType = 'visibility'
      break
    default:
      actionType = 'content'
  }

  return `Override all ${fieldName} ${actionType}`
})
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
