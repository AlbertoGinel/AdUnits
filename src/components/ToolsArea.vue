<template>
  <div class="tool-area">
    <!-- Text Tool Menu -->
    <div v-if="activeTool === 'text'" class="tool-menu">
      <h3 class="menu-title">Edit texts</h3>

      <!-- Main headline -->
      <div class="text-section">
        <h4 class="section-title">Main headline</h4>
        <input
          v-model="headlineValue"
          class="text-input-area"
          placeholder="The ad's main headline goes into this bar"
        />
      </div>

      <!-- Locked headline info -->
      <LockedInfo
        field-name="headline"
        :locked-elements="lockedElementsByTag.headline || []"
        :override-value="overrideStates.headlineOverride.value"
        :is-bulk-mode="isBulkMode"
        @update:override-value="overrideStates.headlineOverride.value = $event"
      />

      <!-- Sub headline -->
      <div class="text-section">
        <h4 class="section-title">Sub headline</h4>
        <input
          v-model="subheadValue"
          class="text-input-area"
          placeholder="The ad's sub headline goes into this bar"
        />
      </div>

      <!-- Locked subhead info -->
      <LockedInfo
        field-name="subhead"
        :locked-elements="lockedElementsByTag.subhead || []"
        :override-value="overrideStates.subheadOverride.value"
        :is-bulk-mode="isBulkMode"
        @update:override-value="overrideStates.subheadOverride.value = $event"
      />

      <!-- Button CTA -->
      <div class="text-section">
        <h4 class="section-title">Button CTA</h4>
        <input v-model="ctaValue" class="text-input-area small" placeholder="SHOP NOW" />
      </div>

      <!-- Locked CTA info -->
      <LockedInfo
        field-name="cta"
        :locked-elements="lockedElementsByTag.cta || []"
        :override-value="overrideStates.ctaOverride.value"
        :is-bulk-mode="isBulkMode"
        @update:override-value="overrideStates.ctaOverride.value = $event"
      />

      <hr class="divider" />

      <!-- Disclaimer text -->
      <div class="text-section">
        <div class="section-header">
          <h4 class="section-title">Disclaimer text</h4>
          <label class="toggle-switch">
            <input type="checkbox" v-model="disclaimerVisibility" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Locked disclaimer visibility info -->
      <LockedInfo
        field-name="disclaimer"
        :locked-elements="lockedVisibilityElementsByTag.disclaimer || []"
        :override-value="overrideStates.disclaimerVisibilityOverride.value"
        :is-bulk-mode="isBulkMode"
        custom-message="Disclaimer visibility does not apply on:"
        custom-label="Override all disclaimer visibility locks"
        @update:override-value="overrideStates.disclaimerVisibilityOverride.value = $event"
      />

      <div>
        <textarea
          v-model="disclaimerValue"
          :disabled="!disclaimerVisibility"
          class="disclaimer-area"
          placeholder="This is placeholder disclaimer text and does not constitute legal advice. Use at your own risk."
        ></textarea>
        <p class="character-count">Character count: {{ characterCount }}/600</p>
      </div>

      <!-- Locked disclaimer info -->
      <LockedInfo
        field-name="disclaimer"
        :locked-elements="lockedElementsByTag.disclaimer || []"
        :override-value="overrideStates.disclaimerOverride.value"
        :is-bulk-mode="isBulkMode"
        @update:override-value="overrideStates.disclaimerOverride.value = $event"
      />

      <!-- Dark text background -->
      <div class="text-section">
        <div class="section-header">
          <h4 class="section-title">Dark text background</h4>
          <label class="toggle-switch">
            <input type="checkbox" v-model="disclaimerBGVisibility" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Locked disclaimerBG visibility info -->
      <LockedInfo
        field-name="disclaimerBG"
        :locked-elements="lockedVisibilityElementsByTag.disclaimerBG || []"
        :override-value="overrideStates.disclaimerBGVisibilityOverride.value"
        :is-bulk-mode="isBulkMode"
        custom-message="Dark text background does not apply on:"
        custom-label="Override all dark text background visibility locks"
        @update:override-value="overrideStates.disclaimerBGVisibilityOverride.value = $event"
      />
      <p class="section-description">
        If your message exceeds 600 characters, you must upload images with the disclaimer included
        in your final jpeg file.
      </p>
    </div>

    <!-- Images Tool Menu -->
    <div v-else-if="activeTool === 'images'" class="tool-menu">
      <h3 class="menu-title">🖼️ Images Tool</h3>
      <div class="menu-content">
        <p class="under-construction">Images menu under construction.</p>
      </div>
    </div>

    <!-- Logos Tool Menu -->
    <div v-else-if="activeTool === 'logos'" class="tool-menu">
      <h3 class="menu-title">🏢 Logos Tool</h3>
      <div class="menu-content">
        <p class="under-construction">Logos menu under construction.</p>
      </div>
    </div>

    <!-- Default State -->
    <div v-else class="tool-menu">
      <div class="empty-state">
        <h3>🛠️ Tools</h3>
        <p>Select a tool from the toolbar above</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'
import LockedInfo from './LockedInfo.vue'

interface Props {
  activeTool?: string
}

defineProps<Props>()

// Smart v-models that automatically switch between bulk/focus mode
const {
  headlineValue,
  subheadValue,
  ctaValue,
  disclaimerValue,
  disclaimerVisibility,
  disclaimerBGVisibility,
  overrideStates,
  lockedElementsByTag,
  lockedVisibilityElementsByTag,
} = useTools()

const { getCurrentView } = useCanvasData()

// Other UI state
const characterCount = computed(() => disclaimerValue.value.length)
const isBulkMode = computed(() => getCurrentView() === 'bulkMode')
</script>

<style scoped>
.tool-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.tool-menu {
  height: 100%;
}

.menu-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.menu-content {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
}

.under-construction {
  color: #ffc107;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.text-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #343a40;
}

.text-input-area {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
  color: #495057;
}

.text-input-area.small {
  max-width: 120px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.disclaimer-area {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  color: #495057;
  resize: vertical;
}

.disclaimer-area:disabled {
  background: #e9ecef;
  color: #6c757d;
}

.character-count {
  font-size: 11px;
  color: #6c757d;
  margin: 4px 0 0 0;
  text-align: right;
}

.divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 20px 0;
}

/* Toggle switch styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 20px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #007bff;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.section-description {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.toggle-switch.active .toggle-slider {
  background-color: #007bff;
}

.toggle-switch.active .toggle-slider:before {
  transform: translateX(20px);
}
</style>
