<!-- tools/sections/TextFieldSection.vue -->
<template>
  <div class="text-section">
    <h4 class="section-title">{{ title }}</h4>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="text-input-area"
      :class="{ small: size === 'small' }"
      :placeholder="placeholder"
    />

    <LockedInfo
      :field-name="fieldName"
      :locked-elements="lockedElements || []"
      :override-value="overrideState?.value || false"
      :is-bulk-mode="isBulkMode"
      @update:override-value="$emit('update:overrideState', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import LockedInfo from '@/components/toolsMenu/Subcomponets/LockedInfo.vue'

interface Props {
  title: string
  placeholder: string
  modelValue: string
  fieldName: string
  lockedElements?: string[]
  overrideState?: { value: boolean }
  size?: 'normal' | 'small'
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
  'update:overrideState': [value: boolean]
}>()

const { getCurrentView } = useCanvasData()
const isBulkMode = computed(() => getCurrentView() === 'bulkMode')
</script>
