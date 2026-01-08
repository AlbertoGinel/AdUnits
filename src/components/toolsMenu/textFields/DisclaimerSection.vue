<!-- components/toolsMenu/sections/DisclaimerSection.vue -->
<template>
  <div class="disclaimer-section">
    <h4 class="text-bentonville-sm-500">Disclaimer</h4>

    <!-- Disclaimer text input -->
    <textarea
      v-model="field.fieldValue.value"
      class="text-input disclaimer-textarea"
      :placeholder="field.placeholder"
      rows="4"
    />

    <!-- Character count -->
    <div
      class="text-light-gray-sm-400 character-count"
      :class="{ warning: field.isOverLimit.value }"
    >
      {{ field.characterCount.value }} / {{ field.config.maxLength }} characters
      <span v-if="field.isOverLimit.value" class="warning-text">
        Exceeds limit - include disclaimer in image
      </span>
    </div>

    <!-- Locked disclaimer text info -->
    <LockedInfo :field="field" lock-type="text" />

    <hr class="divider" />

    <!-- Disclaimer visibility toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="text-bentonville-sm-500">Disclaimer visibility</h4>
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
        <h4 class="text-bentonville-sm-500">Dark text background</h4>
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
import LockedInfo from '@/components/toolsMenu/shared/LockedInfo.vue'
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
  gap: var(--spacing-lg);
}

.disclaimer-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: var(--font-family-primary);
  line-height: 1.5;
}

.character-count {
  text-align: right;
}

.warning-text {
  display: block;
  font-size: calc(var(--font-size-xs) - 1px);
  margin-top: var(--spacing-xs);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.section-description {
  color: var(--color-text-muted);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  margin: var(--spacing-sm) 0 0 0;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: var(--spacing-sm) 0;
}

.character-count {
  text-align: right;
}
</style>
