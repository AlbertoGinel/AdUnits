<template>
  <div class="text-section">
    <h4 class="text-bentonville-sm-500">{{ title }}</h4>
    <input
      class="text-input"
      :value="fieldValue"
      @input="updateFieldValue(($event.target as HTMLInputElement)?.value || '')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextElementType } from '@/types/adUnitElementTypes'
import { useEditTextField } from './useEditTextField'

interface Props {
  type: TextElementType
}

const props = defineProps<Props>()

const { getTextFieldConfig, getTextFieldValue, setTextFieldValue } = useEditTextField()
const title = computed(() => getTextFieldConfig(props.type))

const fieldValue = computed(() => getTextFieldValue(props.type))
const updateFieldValue = (value: string) => {
  setTextFieldValue(props.type, value)
}
</script>

<style scoped>
.text-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}
</style>
