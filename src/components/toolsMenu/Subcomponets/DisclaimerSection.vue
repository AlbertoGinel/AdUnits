<!-- components/toolsMenu/sections/DisclaimerSection.vue -->
<template>
  <div class="disclaimer-section">
    <h4 class="section-title">Disclaimer</h4>

    <!-- Disclaimer text input -->
    <textarea
      :value="text"
      @input="$emit('update:text', ($event.target as HTMLTextAreaElement).value)"
      class="text-input-area disclaimer-textarea"
      placeholder="Enter disclaimer text here..."
      rows="4"
    />

    <!-- Character count -->
    <div class="character-count" :class="{ warning: characterCount > 600 }">
      {{ characterCount }} / 600 characters
      <span v-if="characterCount > 600" class="warning-text">
        ⚠️ Exceeds limit - include disclaimer in image
      </span>
    </div>

    <!-- Locked disclaimer text info -->
    <LockedInfo
      field-name="disclaimer"
      :locked-elements="lockedTextElements"
      :override-value="overrideStates.disclaimerOverride?.value || false"
      :is-bulk-mode="isBulkMode"
      @update:override-value="$emit('update:disclaimerOverride', $event)"
    />

    <hr class="divider" />

    <!-- Disclaimer visibility toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="section-title">Disclaimer visibility</h4>
        <label class="toggle-switch" :class="{ active: visibility }">
          <input
            type="checkbox"
            :checked="visibility"
            @change="$emit('update:visibility', ($event.target as HTMLInputElement).checked)"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- Locked disclaimer visibility info -->
      <LockedInfo
        field-name="disclaimerVisibility"
        :locked-elements="lockedVisibilityElements"
        :override-value="overrideStates.disclaimerVisibilityOverride?.value || false"
        :is-bulk-mode="isBulkMode"
        custom-message="Disclaimer visibility does not apply on:"
        custom-label="Override all disclaimer visibility"
        @update:override-value="$emit('update:disclaimerVisibilityOverride', $event)"
      />
    </div>

    <hr class="divider" />

    <!-- Dark text background toggle -->
    <div class="text-section">
      <div class="section-header">
        <h4 class="section-title">Dark text background</h4>
        <label class="toggle-switch" :class="{ active: bgVisibility }">
          <input
            type="checkbox"
            :checked="bgVisibility"
            @change="$emit('update:bgVisibility', ($event.target as HTMLInputElement).checked)"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="section-description">
        If your message exceeds 600 characters, you must upload images with the disclaimer included
        in your final jpeg file.
      </p>

      <!-- Locked disclaimerBG visibility info -->
      <LockedInfo
        field-name="disclaimerBG"
        :locked-elements="lockedBgElements"
        :override-value="overrideStates.disclaimerBGVisibilityOverride?.value || false"
        :is-bulk-mode="isBulkMode"
        custom-message="Dark background visibility does not apply on:"
        custom-label="Override all dark background visibility"
        @update:override-value="$emit('update:disclaimerBGVisibilityOverride', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import LockedInfo from '@/components/toolsMenu/Subcomponets/LockedInfo.vue'

interface Props {
  text: string
  visibility: boolean
  bgVisibility: boolean
  lockedTextElements: string[]
  lockedVisibilityElements: string[]
  lockedBgElements: string[]
  overrideStates: {
    disclaimerOverride?: { value: boolean }
    disclaimerVisibilityOverride?: { value: boolean }
    disclaimerBGVisibilityOverride?: { value: boolean }
  }
}

const props = defineProps<Props>()

defineEmits<{
  'update:text': [value: string]
  'update:visibility': [value: boolean]
  'update:bgVisibility': [value: boolean]
  'update:disclaimerOverride': [value: boolean]
  'update:disclaimerVisibilityOverride': [value: boolean]
  'update:disclaimerBGVisibilityOverride': [value: boolean]
}>()

const { getCurrentView } = useCanvasData()
const isBulkMode = computed(() => getCurrentView() === 'bulkMode')

const characterCount = computed(() => props.text?.length || 0)
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
