<template>
  <div v-if="shouldShow" class="locked-info">
    <p class="locked-message">
      <span class="locked-icon">🔒</span>
      {{ messageText }}
    </p>
    <div class="flex items-center space-x-2 text-[#2c2c54]">
      <input
        :id="checkboxId"
        v-model="overrideState"
        type="checkbox"
        class="w-4 h-4 rounded border-gray-400 focus:ring-2 focus:ring-blue-500"
      />
      <label :for="checkboxId" class="text-[15px] font-medium select-none">
        {{ labelText }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, type Ref } from 'vue'

interface TextFieldState {
  fieldName: string
  isBulkMode: ComputedRef<boolean>
  getCustomMessage: (type: 'text' | 'visibility' | 'bgVisibility') => string
  // Properties that LockedInfo actually accesses based on lockType
  lockedElements?: ComputedRef<string[]>
  lockedVisibilityElements?: ComputedRef<string[]>
  lockedBgElements?: ComputedRef<string[]>
  overrideState?: Ref<boolean>
  visibilityOverrideState?: Ref<boolean>
  bgVisibilityOverrideState?: Ref<boolean>
}

interface Props {
  field: TextFieldState
  lockType: 'text' | 'visibility' | 'bgVisibility'
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
    default:
      return undefined
  }
}

const getOverrideState = () => {
  switch (props.lockType) {
    case 'text':
      return props.field.overrideState
    case 'visibility':
      return props.field.visibilityOverrideState
    case 'bgVisibility':
      return props.field.bgVisibilityOverrideState
    default:
      return { value: false }
  }
}

// Computed properties for dynamic content
const shouldShow = computed(() => {
  const lockedElements = getLockedElements()
  const elementsArray = lockedElements?.value || []
  return props.field.isBulkMode.value && elementsArray.length > 0
})

const messageText = computed(() => {
  const lockedElements = getLockedElements()
  const elementsArray = lockedElements?.value || []
  const customMessage = props.field.getCustomMessage(props.lockType)
  return `${customMessage} ${elementsArray.join(', ')}`
})

const labelText = computed(() => {
  const fieldName = props.field.fieldName
  const lockTypeText = props.lockType === 'text' ? 'text' : 'visibility'
  return `Override all ${fieldName} ${lockTypeText}`
})

const checkboxId = computed(() => {
  const fieldName = props.field.fieldName
  const lockTypeText = props.lockType === 'text' ? '' : props.lockType
  return `override${capitalize(fieldName)}${lockTypeText}`
})

const overrideState = computed({
  get: () => getOverrideState()?.value || false,
  set: (value: boolean) => {
    const overrideStateRef = getOverrideState()
    if (overrideStateRef) {
      overrideStateRef.value = value
    }
  },
})

// Utility function to capitalize first letter
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
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
  margin: 0 0 2px 0;
  font-size: 10px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 3px;
}

.locked-icon {
  font-size: 14px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.text-\[15px\] {
  font-size: 12px;
}

.font-medium {
  font-weight: 500;
}

.select-none {
  user-select: none;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.rounded {
  border-radius: 0.25rem;
}

.border-gray-400 {
  border-color: #9ca3af;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:ring-blue-500:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.text-\[#2c2c54\] {
  color: #2c2c54;
}
</style>
