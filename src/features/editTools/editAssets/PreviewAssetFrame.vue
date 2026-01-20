<template>
  <div>atiende frameContentState: {{ contentState }}</div>
  <div class="image-preview">
    <!-- Dynamic content based on content state -->
    <div v-if="contentState === 'image-preview'" class="preview-imageElem">
      <img :src="loadedImage?.src || ''" alt="Current asset" />
    </div>

    <div v-else-if="contentState === 'preview-placeholder'" class="preview-placeholder">
      <div class="fallback-icon">📷</div>
    </div>

    <div v-else-if="contentState === 'drag-photos-here'" class="drag-photos-here">
      <div class="fallback-icon">⬆️</div>
    </div>

    <!-- Dynamic buttons using ActionButton system -->
    <div v-if="currentButtons.length > 0" class="image-actions">
      <button
        v-for="button in currentButtons"
        :key="button.id"
        :class="button.class || 'btn-preview'"
        :disabled="button.disabled || isButtonDisabled"
        @click="handleButtonClick(button.action)"
      >
        {{ button.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditAssets } from './useEditAsset'

const {
  contentState,
  loadedImage,
  currentButtons,
  isButtonDisabled,
  handleChangeAsset,
  handleUploadAsset,
  handleRemoveAsset,
  handleRemoveTemporalImage,
  handleStartCrop,
  handleSaveCrop,
  handleCancelCrop,
} = useEditAssets()

// Action dispatcher
const actionMap = {
  handleChangeAsset,
  handleUploadAsset,
  handleRemoveAsset,
  handleRemoveTemporalImage,
  handleStartCrop,
  handleSaveCrop,
  handleCancelCrop,
}

const handleButtonClick = (action: string) => {
  const actionFunction = actionMap[action as keyof typeof actionMap]
  if (actionFunction) {
    actionFunction()
  } else {
    console.warn('Unknown action:', action)
  }
}
</script>

<style scoped>
.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
  background: #f8f9fa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-imageElem {
  width: 100%;
  height: 100%;
  min-height: 200px; /* Match parent min-height */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Hide any overflow */
}

img {
  height: 100%;
  width: 100%;
  object-fit: cover; /* ✅ This makes image cover entire container */
  object-position: center; /* ✅ Center the image within the frame */
  display: block;
}

.preview-placeholder {
  color: #6c757d;
  font-size: 14px;
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.drag-photos-here {
  color: #6c757d;
  font-size: 14px;
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #adb5bd;
  border-radius: 8px;
  background: rgba(108, 117, 125, 0.1);
}

.fallback-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.btn-preview {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.btn-preview:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #adb5bd;
}

.btn-preview:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
