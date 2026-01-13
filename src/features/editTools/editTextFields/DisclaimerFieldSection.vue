<template>
  <div class="disclaimer-section">
    <div class="section-header">
      <h4 class="text-bentonville-sm-500">Disclaimer visibility</h4>
      <label class="toggle-switch" :class="{ active: getVisibilityValue('disclaimer') }">
        <input
          type="checkbox"
          :checked="getVisibilityValue('disclaimer')"
          @change="
            setVisibilityValue('disclaimer', ($event.target as HTMLInputElement)?.checked || false)
          "
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Disclaimer text input -->
    <textarea
      :value="getTextFieldValue('disclaimer')"
      @input="setTextFieldValue('disclaimer', ($event.target as HTMLTextAreaElement)?.value || '')"
      class="text-input disclaimer-textarea"
      placeholder="Enter disclaimer text here..."
      rows="4"
    />

    <!-- Character count -->
    <div class="text-light-gray-sm-400 character-count" :class="{ warning: isOverLimit }">
      {{ characterCount }} / 600 characters
      <span v-if="isOverLimit" class="warning-text">
        Exceeds limit - include disclaimer in image
      </span>
    </div>

    <hr class="divider" />

    <!-- Dark text background toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="text-bentonville-sm-500">Dark text background</h4>
        <label class="toggle-switch" :class="{ active: getVisibilityValue('disclaimerBG') }">
          <input
            type="checkbox"
            :checked="getVisibilityValue('disclaimerBG')"
            @change="
              setVisibilityValue(
                'disclaimerBG',
                ($event.target as HTMLInputElement)?.checked || false,
              )
            "
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="section-description">
        If your message exceeds 600 characters, you must upload images with the disclaimer included
        in your final jpeg file.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditTextField } from './useEditTextField'

const { getTextFieldValue, setTextFieldValue, getVisibilityValue, setVisibilityValue } =
  useEditTextField()

// Character counting logic
const disclaimerText = computed(() => getTextFieldValue('disclaimer'))
const characterCount = computed(() => disclaimerText.value.length)
const isOverLimit = computed(() => characterCount.value > 600)
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

.character-count.warning {
  color: var(--color-error);
}

.warning-text {
  display: block;
  font-size: calc(var(--font-size-xs) - 1px);
  margin-top: var(--spacing-xs);
  color: var(--color-error);
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

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}
</style>
