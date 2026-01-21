<template>
  <div class="preview-container">
    <!-- Show message if no asset in focus mode -->
    <div v-if="isFocusMode && !hasAsset" class="no-elements-message">
      <p>This ad unit does not contain {{ isLogoMode ? 'a logo' : 'an image' }} element.</p>
    </div>

    <!-- Normal asset editing content -->
    <div v-else>
      <div class="image-section">
        <h4 class="text-caption">Lifestyle Photo</h4>
        <PreviewAssetFrame />
      </div>

      <!-- Alt text section (for both images AND logos) -->
      <div v-if="altText !== undefined" class="alt-text-section">
        <h4 class="text-caption text-caption--medium">Alt text*</h4>
        <p class="feedback-text">
          {{
            isLogoMode
              ? 'Alt text should describe what the logo says or represents for screen readers.'
              : "Alt text should be a long-form description of what's visually represented in your ad."
          }}
        </p>
        <input
          :value="altText"
          @input="updateAltText(($event.target as HTMLInputElement)?.value || '')"
          type="text"
          class="text-input text-caption"
          :placeholder="
            isLogoMode ? 'Logo description goes here' : 'Image\'s alternate text goes here'
          "
          maxlength="150"
        />
        <div class="text-light-gray-xs-400 character-count">
          Character count: {{ altText?.length || 0 }}/150
        </div>
      </div>

      <!-- Action Buttons (only in upload mode) -->
      <div v-if="activeSubView === 'upload'" class="action-buttons">
        <button
          @click="handleUploadAsset()"
          :disabled="!hasUploadTemp"
          class="button-action upload"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditAssets } from './useEditAsset'
import PreviewAssetFrame from './PreviewAssetFrame.vue'

const { isFocusMode, hasAsset, isLogoMode, altText, updateAltText, activeSubView, hasUploadTemp } =
  useEditAssets()

const handleUploadAsset = async () => {}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.text-caption {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 4px 0;
}

.text-caption--medium {
  font-weight: 500;
}

.image-section {
  display: flex;
  flex-direction: column;
}

.alt-text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-text {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  background: white;
}

.text-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.character-count {
  text-align: right;
  font-size: 11px;
  color: #6c757d;
}

.text-light-gray-xs-400 {
  color: #6c757d;
}

.no-elements-message {
  padding: 24px;
  text-align: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-elements-message p {
  margin: 0;
  font-size: 14px;
}

/* Button styles */
.button-action {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.button-action:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #80bdff;
}

.button-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e9ecef;
  color: #6c757d;
  border-color: #dee2e6;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
