<!-- tools/assets/UploadAssets.vue -->
<template>
  <div class="tool-menu">
    <button @click="control.currentAssetScreen.value = 'edit'" class="btn-secondary">Cancel</button>

    <h3 class="menu-title">Upload {{ control.assetDisplayText.value.plural }}</h3>
    <p class="menu-subtitle">
      Upload your {{ control.assetDisplayText.value.plural.toLowerCase() }}
      {{ control.isLogoMode.value ? '' : 'and assign alt text' }}
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
      <div v-if="!hasFile" class="drop-zone-content">
        <span class="upload-icon">📁</span>
        <p class="drop-text">Drag {{ control.assetDisplayText.value.plural.toLowerCase() }} here</p>
        <p class="browse-text">or browse</p>
      </div>

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
        <button @click.stop="handleRemoveImage" class="btn-remove">
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

    <!-- File size and dimension limits -->
    <div class="upload-limits">
      <p>• 10MB maximum file size</p>
      <p>• Maximum dimensions 5000x5000px</p>
    </div>

    <!-- Alt Text Section (only for images, not logos) -->
    <div v-if="!control.isLogoMode.value" class="alt-text-section">
      <h4 class="section-title">Alt text*</h4>
      <p class="section-description">
        Alt text should be a long-form description of what's visually represented in your ad.
      </p>
      <input
        v-model="altText"
        type="text"
        class="alt-text-input"
        placeholder="Image's alternate text goes here"
        maxlength="150"
      />
      <div class="character-count">Character count: {{ altText.length }}/150</div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      <button @click="handleInsert" :disabled="!hasFile || isUploading" class="btn-primary">
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

// 🎮 Connect to shared composable
const control = useEditAssetsControl()

const imageManager = useImageManager()
const suspenseManager = useSuspenseManager()
const creativeAPI = useCreativeAPI()
const canvasData = useCanvasData()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const altText = ref('')
const currentFile = ref<File | null>(null)

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

  try {
    // Store file reference for insert
    currentFile.value = file

    // Cache image using ImageManager (stores in uploadTemp only)
    await imageManager.cacheTemporaryImage(file)

    console.log('✅ Temporary image loaded and ready for preview')
  } catch (error) {
    console.error('❌ Failed to process image:', error)
  }
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
      altText: control.isLogoMode.value ? '' : altText.value || '', // Only include alt text for images
    })

    if (result.success && result.assetId) {
      console.log('✅ API upload successful:', result.assetId)

      // Clear local UI state (uploadTemp already cleared in insertAsset)
      currentFile.value = null
      altText.value = ''

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
.tool-menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

.menu-title {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

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
  border: 2px dashed #007bff;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 0px;

  object-fit: cover;
}

.drop-zone:not(.has-image) {
  cursor: pointer;
}

.drop-zone.has-image {
  cursor: default;
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

.drop-zone-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 10px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.6;
}

.drop-text {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
}

.browse-text {
  font-size: 16px;
  color: #007bff;
  margin: 0;
  text-decoration: underline;
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

.btn-remove {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  background: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  opacity: 0;
  pointer-events: none;
}

.preview-content:hover .btn-remove {
  opacity: 1;
  pointer-events: auto;
}

.btn-remove:hover {
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

.upload-limits p {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
}

.alt-text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  margin: 0;
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
  font-size: 12px;
  color: #6c757d;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-secondary {
  background: white;
  color: #212529;
  border: 2px solid #212529;
}

.btn-secondary:hover {
  background: #212529;
  color: white;
}
</style>
