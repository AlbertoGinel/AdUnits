<template>
  <div class="image-preview">
    <!-- Dynamic content based on content state -->
    <div v-if="contentState === 'image-preview'" class="preview-imageElem">
      <img :src="loadedImage?.src || ''" alt="Current asset" />
    </div>

    <div v-else-if="contentState === 'preview-placeholder'" class="preview-placeholder">
      <div class="fallback-icon">📷</div>
    </div>

    <div
      v-else-if="contentState === 'drag-photos-here'"
      class="drag-photos-here"
      :class="{ 'drag-over': isDragOver, processing: isFileProcessing }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="!isFileProcessing && triggerFileInput()"
    >
      <div v-if="!isFileProcessing" class="upload-prompt">
        <div class="fallback-icon">⬆️</div>
        <p class="drag-text">Drag {{ currentAssetType }} here</p>
        <p class="browse-text">or click to browse</p>
        <div class="upload-limits">
          <span>• 10MB maximum file size</span>
          <span>• Maximum dimensions 5000x5000px</span>
        </div>
      </div>

      <div v-else class="processing-state">
        <div class="spinner">⏳</div>
        <p>Processing file...</p>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        @change="handleFileInputChange"
        accept="image/*"
        style="display: none"
      />
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
  currentAssetType,
  isButtonDisabled,

  // State and navigation
  isCropMode,
  goToChangeAsset,
  goToUploadAsset,

  // File processing (business logic only)
  isDragOver,
  isFileProcessing,
  fileInput,
  handleFileSelection,

  // Business logic actions
  handleRemoveAsset,
  handleRemoveTemporalImage,
} = useEditAssets()

// Drag & Drop handlers - defined in component (UI concerns)
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  // Only set to false if we're leaving the drop zone itself
  if (!(e.currentTarget as Element)?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    await handleFileSelection(files[0])
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileInputChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0 && files[0]) {
    await handleFileSelection(files[0])
  }
}

// Simple handle functions - directly in Vue
const handleChangeAsset = () => goToChangeAsset()
const handleUploadAsset = () => goToUploadAsset()
const handleStartCrop = () => {
  isCropMode.value = true
}
const handleSaveCrop = () => {
  isCropMode.value = false
}
const handleCancelCrop = () => {
  isCropMode.value = false
}

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
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.drag-photos-here.drag-over {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  transform: scale(1.02);
}

.drag-photos-here.processing {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  cursor: default;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drag-text {
  font-weight: 600;
  margin: 0;
  font-size: 16px;
}

.browse-text {
  font-size: 12px;
  color: #007bff;
  margin: 0;
}

.upload-limits {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
}

.upload-limits span {
  font-size: 11px;
  color: #6c757d;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
