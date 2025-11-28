<!-- tools/images/UploadImages.vue -->
<template>
  <div class="tool-menu">
    <h3 class="menu-title">Upload images</h3>
    <p class="menu-subtitle">Upload your photo and assign alt text</p>

    <!-- Drop Zone / Preview -->
    <div
      class="drop-zone"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="!uploadedImage && triggerFileInput()"
      :class="{ 'drag-over': isDragOver, 'has-image': uploadedImage }"
      :style="{ cursor: uploadedImage ? 'default' : 'pointer' }"
    >
      <!-- Show upload prompt when no image -->
      <div v-if="!uploadedImage" class="drop-zone-content">
        <span class="upload-icon">📁</span>
        <p class="drop-text">Drag photos here</p>
        <p class="browse-text">or browse</p>
      </div>

      <!-- Show preview when image uploaded -->
      <div v-else class="preview-content">
        <img
          v-if="uploadedImage.image"
          :src="uploadedImage.image.src"
          alt="Upload preview"
          class="preview-image"
        />
        <button @click.stop="handleRemoveImage" class="btn-remove">
          <span>Remove image</span>
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

    <!-- Alt Text Section -->
    <div class="alt-text-section">
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
      <button @click="$emit('navigate', 'edit')" class="btn-secondary" :disabled="isUploading">
        Cancel
      </button>
      <button @click="handleInsert" :disabled="!uploadedImage || isUploading" class="btn-primary">
        {{ isUploading ? 'Uploading...' : 'Insert Image' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useImageStore, type ImageAsset } from '@/stores/useImageStore'
import { useCreativeAPI } from '@/composables/api/useCreativeAPI'

const emit = defineEmits<{
  navigate: [subView: string]
  insert: [imageId: string]
}>()

const imageStore = useImageStore()
const { loadImage } = useImageManager()
const creativeAPI = useCreativeAPI()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const uploadedImage = ref<ImageAsset | null>(null)
const altText = ref('')
const isUploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  // Don't allow drop if image already uploaded
  if (uploadedImage.value) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    await processFile(files[0])
  }
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0 && files[0]) {
    await processFile(files[0])
  }
}

const processFile = async (file: File) => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  try {
    console.log('📤 Processing upload:', file.name)

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file)

    // Load to reserved uploadTemp slot
    const asset = await loadImage(
      '__temp__upload',
      objectUrl,
      'image',
      'uploadTemp',
      true, // isReserved
    )

    uploadedImage.value = asset
    console.log('✅ Image loaded to uploadTemp')
  } catch (error) {
    console.error('❌ Failed to process image:', error)
    alert('Failed to load image')
  }
}

const handleInsert = async () => {
  if (!uploadedImage.value || !fileInput.value?.files?.[0]) return

  const file = fileInput.value.files[0]

  try {
    isUploading.value = true
    console.log('📤 Uploading to server...')

    // Upload to backend
    const response = await creativeAPI.uploadAsset('creative-001', file)

    console.log('✅ Upload successful:', response.path)

    // TODO: Now you have the server path
    // You can:
    // 1. Create a permanent image entry with real ID
    // 2. Update creative data with new asset
    // 3. Clear uploadTemp

    // For now, emit with temp ID
    emit('insert', 'uploadTemp')
    emit('navigate', 'edit')
  } catch (error) {
    console.error('❌ Upload failed:', error)
    alert(error instanceof Error ? error.message : 'Upload failed')
  } finally {
    isUploading.value = false
  }
}

const handleRemoveImage = () => {
  console.log('🗑️ Removing uploaded image')

  // Clear the uploadedImage ref
  uploadedImage.value = null

  // Clear uploadTemp from reserved store
  imageStore.reserved.uploadTemp = null

  // Clear alt text
  altText.value = ''

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  console.log('✅ Upload memory cleared')
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
