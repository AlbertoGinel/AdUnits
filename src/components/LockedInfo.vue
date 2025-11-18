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
import { computed } from 'vue'

interface Props {
  fieldName: string
  lockedElements: string[]
  overrideValue: boolean
  isBulkMode: boolean
  customMessage?: string
  customLabel?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:overrideValue': [value: boolean]
}>()

// Computed properties for dynamic content
const shouldShow = computed(() => props.isBulkMode && props.lockedElements?.length > 0)

const messageText = computed(() => {
  if (props.customMessage) {
    return props.customMessage
  }
  return `Does not apply on: ${props.lockedElements.join(', ')}`
})

const labelText = computed(() => {
  if (props.customLabel) {
    return props.customLabel
  }
  return `Override all ${props.fieldName} text`
})

const checkboxId = computed(() => `override${capitalize(props.fieldName)}s`)

const overrideState = computed({
  get: () => props.overrideValue,
  set: (value: boolean) => {
    emit('update:overrideValue', value)
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
