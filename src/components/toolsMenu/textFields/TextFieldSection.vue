<!-- tools/sections/TextFieldSection.vue -->
<template>
  <div class="text-section">
    <h4 class="section-title">{{ title }}</h4>
    <input
      v-model="field.fieldValue.value"
      class="text-input-area"
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
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin: 0;
  line-height: 1.4;
}

.text-input-area {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  color: #212529;
  background: #ffffff;
  transition: all 0.15s ease-in-out;
  box-sizing: border-box;
}

.text-input-area:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.text-input-area.small {
  height: 36px;
}

.text-input-area::placeholder {
  color: #6c757d;
  opacity: 1;
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
