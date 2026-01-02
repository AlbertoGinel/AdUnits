<!-- tools/assets/UploadAssets.vue -->
<template>
  <div class="tool-menu">
    <button @click="control.currentAssetScreen.value = 'edit'" class="btn-add-image">
      <span v-html="getIcon('backCircle')"></span>Back to image editor
    </button>

    <h3 class="text-bentonville-xl-700">Upload {{ control.assetDisplayText.value.plural }}</h3>
    <p class="feedback-text">
      Upload your {{ control.assetDisplayText.value.plural.toLowerCase() }} and assign alt text
    </p>

    <!-- Drop Zone / Preview -->
    <div
      class="drop-zone"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="!hasFile && triggerFileInput()"
      :class="{ 'drag-over': isDragOver, 'has-image': hasFile }"
      :style="{ cursor: hasFile ? 'default' : 'pointer' }"
    >
      <!-- Show upload prompt when no asset -->
      <template v-if="!hasFile">
        <div class="upload-prompt">
          <span class="upload-icon" v-html="getIcon('addImage')"></span>
          <p class="text-caption text-caption--medium drag-images">
            Drag {{ control.assetDisplayText.value.plural.toLowerCase() }} here
          </p>
          <p class="browse-text">or browse</p>
          <div class="upload-limits">
            <span class="text-feedback-xs-400">• 10MB maximum file size</span>
            <span class="text-feedback-xs-400">• Maximum dimensions 5000x5000px</span>
          </div>
        </div>
      </template>

      <!-- Show preview when asset uploaded -->
      <div v-else class="preview-content">
        <img
          v-if="previewImage"
          :src="previewImage.src"
          :alt="`${control.assetDisplayText.value.singular} preview`"
          class="preview-image"
        />

        <div v-else-if="error" class="error-content">
          <span class="error-icon">⚠️</span>
          <p class="error-text">{{ error }}</p>
        </div>
        <button @click.stop="handleRemoveImage" class="btn-preview btn-remove">
          <span>Remove {{ control.assetDisplayText.value.singular.toLowerCase() }}</span>
          <span class="remove-icon">⊗</span>
        </button>
      </div>

      <input
        type="file"
        @change="handleFileSelect"
        accept="image/*"
        style="display: none"
        ref="fileInput"
      />
    </div>

    <!-- Alt Text Section -->
    <div class="alt-text-section">
      <h4 class="text-light-gray-sm-400">Alt text*</h4>
      <p class="section-description">
        Alt text should be a long-form description of what's visually represented in your ad.
      </p>
      <input
        v-model="altText"
        type="text"
        class="text-input"
        placeholder="Image's alternate text goes here"
        maxlength="150"
        :disabled="!hasFile"
      />
      <div class="text-light-gray-xs-400 character-count">
        Character count: {{ altText.length }}/150
      </div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      <button
        @click="handleInsert"
        :disabled="!hasFile || isUploading"
        class="button-action insert"
      >
        {{ isUploading ? 'Uploading...' : `Insert ${control.assetDisplayText.value.singular}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useEditAssetsControl } from './useEditAssetsControl'
import { useIcons } from '@/composables/utils/useIcons'

const { getIcon } = useIcons()

// 🎮 Connect to shared composable
const control = useEditAssetsControl()

const imageManager = useImageManager()
const suspenseManager = useSuspenseManager()
const creativeAPI = useCreativeAPI()
const canvasData = useCanvasData()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const currentFile = ref<File | null>(null)

// ✅ Reactive altText that syncs with uploadTemp in Pinia
const altText = computed({
  get: () => {
    const uploadTemp = imageManager.getUploadTempImage()
    return uploadTemp?.altText || ''
  },
  set: (value: string) => {
    imageManager.updateUploadTempAltText(value)
  },
})

// Computed properties
const hasFile = computed(() => imageManager.hasUploadTemp())
const isUploading = computed(() => suspenseManager.assetOperationInProgress.value)
const previewImage = computed(() => {
  const uploadTemp = imageManager.getUploadTempImage()
  if (!uploadTemp) return null
  // Create image element from uploadTemp blob URL
  const img = new Image()
  img.src = uploadTemp.url
  return img
})
const error = computed(() => {
  // Could connect to error state from notifications or suspense manager
  return null
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  // Don't allow drop if image already selected
  if (hasFile.value) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    handleFileSelection(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0 && files[0]) {
    handleFileSelection(files[0])
  }
}

const handleFileSelection = async (file: File) => {
  // TODO: File type checking, size limits, etc.
  // TODO: Add file size validation (10MB limit)
  // TODO: Add dimension validation (5000x5000px limit)

  // Store file reference for insert
  currentFile.value = file

  // Cache image using ImageManager - NO altText since it can change later
  await imageManager.cacheTemporaryImage(file, control.assetType.value)

  console.log('✅ Temporary image loaded and ready for preview')
}

const handleInsert = async () => {
  if (!currentFile.value || !imageManager.hasUploadTemp()) return

  const file = currentFile.value
  const creativeId = canvasData.getCreativeId()

  if (!creativeId) {
    console.error('❌ No creative ID available')
    return
  }

  try {
    console.log('📤 Starting API upload for:', file.name)

    const result = await creativeAPI.insertAsset(creativeId, file, {
      type: control.assetType.value, // Use the asset type from control
      name: file.name.replace(/\.[^/.]+$/, ''),
      altText: altText.value || '', // Include alt text for both images and logos
    })

    if (result.success && result.assetId) {
      console.log('✅ API upload successful:', result.assetId)

      // Clear local UI state (uploadTemp already cleared in insertAsset)
      currentFile.value = null

      if (fileInput.value) {
        fileInput.value.value = ''
      }

      // Navigate back using composable
      control.currentAssetScreen.value = 'edit'

      console.log('✅ Upload complete, navigating to edit view')
    } else {
      // API upload failed - uploadTemp stays for retry
      console.error('❌ API upload failed:', result.message)
    }
  } catch (error) {
    console.error('❌ Upload error:', error)
    // uploadTemp stays for retry
  }
}

const handleRemoveImage = () => {
  // Clear uploadTemp through imageManager
  imageManager.clearUploadTemp()

  // Clear local state
  currentFile.value = null
  altText.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.menu-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drop-zone {
  border: 2px dashed var(--color-gray-200);
  border-radius: 10px;
  background: var(--color-primary-light-blue-ui);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: var(--spacing-lg);
  margin: 15px 0px;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-grow: 1;
}

.upload-limits {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  line-height: 1;
}

.drop-zone:not(.has-image) {
  cursor: pointer;
}

.drop-zone.has-image {
  cursor: default;
  padding: 0; /* Remove padding when image is present */
}

.drop-zone.drag-over {
  border-color: #0056b3;
  background: #e7f3ff;
  transform: scale(1.02);
}

.drop-zone.has-image {
  border-style: solid;
  border-color: #dee2e6;
}

.drag-images {
  font-weight: var(--font-weight-medium);
}

.upload-icon {
}

.drop-text {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
}

.browse-text {
  font-size: 11px;
  color: #007bff;
  margin: 0;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Add it here to the image */
  display: block;
}

.btn-preview.btn-remove {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
}

.preview-content:hover .btn-preview {
  opacity: 1;
  pointer-events: auto;
}

.btn-preview:hover {
  background: #f8f9fa;
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.remove-icon {
  font-size: 20px;
  line-height: 1;
}

.error-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 14px;
  color: #dc3545;
  margin: 0;
  line-height: 1.4;
}

.upload-limits {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-limits .text-feedback-sm-400 {
  margin: 0;
}

.alt-text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.alt-text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: #f0f8ff;
  box-sizing: border-box;
}

.alt-text-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.character-count {
  text-align: right;
}

.btn-add-image {
  width: 75%;
  margin-bottom: var(--spacing-xl);
}
</style>
