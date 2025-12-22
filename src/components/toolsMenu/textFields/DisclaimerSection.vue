<!-- components/toolsMenu/sections/DisclaimerSection.vue -->
<template>
  <div class="disclaimer-section">
    <h4 class="section-title">Disclaimer</h4>

    <!-- Disclaimer text input -->
    <textarea
      v-model="field.fieldValue.value"
      class="text-input-area disclaimer-textarea"
      :placeholder="field.placeholder"
      rows="4"
    />

    <!-- Character count -->
    <div class="character-count" :class="{ warning: field.isOverLimit.value }">
      {{ field.characterCount.value }} / {{ field.config.maxLength }} characters
      <span v-if="field.isOverLimit.value" class="warning-text">
        ⚠️ Exceeds limit - include disclaimer in image
      </span>
    </div>

    <!-- Locked disclaimer text info -->
    <LockedInfo :field="field" lock-type="text" />

    <hr class="divider" />

    <!-- Disclaimer visibility toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="section-title">Disclaimer visibility</h4>
        <label class="toggle-switch" :class="{ active: field.visibility?.value }">
          <input type="checkbox" v-model="field.visibility.value" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- Locked disclaimer visibility info -->
      <LockedInfo :field="field" lock-type="visibility" />
    </div>

    <hr class="divider" />

    <!-- Dark text background toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="section-title">Dark text background</h4>
        <label class="toggle-switch" :class="{ active: field.bgVisibility?.value }">
          <input type="checkbox" v-model="field.bgVisibility.value" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="section-description">
        If your message exceeds 600 characters, you must upload images with the disclaimer included
        in your final jpeg file.
      </p>

      <!-- Locked disclaimerBG visibility info -->
      <LockedInfo :field="field" lock-type="bgVisibility" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LockedInfo from '@/components/toolsMenu/textFields/LockedInfo.vue'
import { useTextField } from './useTextFields'

const field = useTextField('disclaimer', {
  type: 'textarea',
  hasVisibility: true,
  hasBgVisibility: true,
  maxLength: 600,
  placeholder: 'Enter disclaimer text here...',
  customMessages: {
    text: 'Does not apply on:',
    visibility: 'Disclaimer visibility does not apply on:',
    bgVisibility: 'Dark background visibility does not apply on:',
  },
})
</script>

<style scoped>
.disclaimer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
}

.disclaimer-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.character-count {
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  transition: color 0.2s;
}

.character-count.warning {
  color: #dc3545;
  font-weight: 600;
}

.warning-text {
  display: block;
  font-size: 11px;
  margin-top: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: #ced4da;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: #28a745;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

.section-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 8px 0 0 0;
}

.divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 8px 0;
}

.text-input-area {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-input-area:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
