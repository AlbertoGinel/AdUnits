<!-- tools/sections/TextFieldSection.vue -->
<template>
  <div class="text-section">
    <h4 class="text-bentonville-sm-500">{{ title }}</h4>
    <input
      v-model="field.fieldValue.value"
      class="text-input"
      :class="{ small: size === 'small' }"
      :placeholder="field.placeholder"
    />

    <LockedInfo :field="field" lock-type="text" />
  </div>
</template>

<style scoped>
.text-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}
</style>

<script setup lang="ts">
import LockedInfo from '@/components/toolsMenu/textFields/LockedInfo.vue'
import { useTextField } from './useTextFields'

interface Props {
  title: string
  fieldName: string
  size?: 'normal' | 'small'
}

const props = defineProps<Props>()

const field = useTextField(props.fieldName, {
  type: 'input',
  hasVisibility: false,
  hasBgVisibility: false,
  maxLength: 200,
  placeholder: `Enter ${props.fieldName} text here...`,
  customMessages: {
    text: 'Does not apply on:',
    visibility: '',
    bgVisibility: '',
  },
})
</script>
