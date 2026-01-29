<template>
  <div class="image-preview" :class="{ 'grey-background': contentState === 'preview-placeholder' }">
    <!-- Dynamic content based on content state -->
    <div v-if="contentState === 'image-preview'" class="preview-imageElem">
      <img v-if="loadedImageUrl" :src="loadedImageUrl" alt="Current asset" />
      <div v-else class="image-skeleton">
        <div class="skeleton-icon">📷</div>
      </div>
    </div>

    <div v-else-if="contentState === 'preview-placeholder'" class="preview-placeholder">
      <span v-html="getIcon('imageTool')"></span>
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
import { computed } from 'vue'
import { useEditAssets } from './useEditAsset'

import { useFieldService } from '@/data/services/useFieldService'
import { useEditTools } from '@/features/editTools/useEditTools'
import { useImageStore } from '@/data/stores/useImageStore'
import { useIcons } from '@/features/utils/useIcons'

const { getIcon } = useIcons()

const {
  contentState,
  currentAssetType, // We'll use this to get the current asset ID
  currentButtons,
  isButtonDisabled,

  // State and navigation
  //isCropMode,
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
  hasUploadTemp,

  // Crop functions from composable
  handleStartCrop: cropStart,
  handleSaveCrop: cropSave,
  handleCancelCrop: cropCancel,
} = useEditAssets()

// Get current asset ID using field service
const { getFieldValue } = useFieldService()
const { selectedTool } = useEditTools()

const currentAssetId = computed(() => {
  if (selectedTool.value !== 'image' && selectedTool.value !== 'logo') return ''
  return getFieldValue(selectedTool.value, 'imageID') || ''
})

// Get image URL using the async system
const imageStore = useImageStore()

const loadedImageUrl = computed(() => {
  // In upload mode, prioritize temp upload
  if (hasUploadTemp.value) {
    const tempUpload = imageStore.getUploadTemp()
    return tempUpload.url
  }

  // For saved images, get URL from image store
  if (!currentAssetId.value) return null

  const savedImage = imageStore.getImage(currentAssetId.value)
  return savedImage?.url || null
})

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
const handleStartCrop = () => cropStart() // ✅ Call actual function from composable
const handleSaveCrop = () => cropSave() // ✅ Call actual function from composable
const handleCancelCrop = () => cropCancel() // ✅ Call actual function from composable

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

.image-skeleton {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.image-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: inherit;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.skeleton-icon {
  font-size: 2rem;
  color: #c0c0c0;
  z-index: 1;
  opacity: 0.6;
}

.grey-background {
  background-color: var(--color-gray-200);
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
