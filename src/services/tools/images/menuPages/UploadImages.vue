<template>
  <div class="upload-images">
    <!-- Header with back button -->
    <div class="page-header">
      <button class="back-btn" @click="goBackToEditor">
        <span class="back-arrow">←</span>
        Back to image editor
      </button>
      <h3>Upload images</h3>
      <p>Upload your photo and assign alt text</p>
    </div>

    <!-- Upload area -->
    <div class="upload-section">
      <div class="upload-area" @click="triggerUpload" @drop="handleDrop" @dragover.prevent>
        <div class="upload-icon">📁</div>
        <div class="upload-text">
          <div class="upload-title">Drag photos here</div>
          <div class="upload-subtitle">or browse</div>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>

      <!-- Upload constraints -->
      <div class="upload-constraints">
        <div class="constraint">• 10MB maximum file size</div>
        <div class="constraint">• Maximum dimensions 5000x5000px</div>
      </div>
    </div>

    <!-- Alt text section -->
    <div class="alt-text-section">
      <label class="alt-text-label">Alt text*</label>
      <textarea
        v-model="altText"
        class="alt-text-input"
        placeholder="Alt text should be a long-form description of what's visually represented in your ad."
      ></textarea>
      <div class="alt-text-placeholder">Image's alternate text goes here</div>
      <div class="character-count">Character count: {{ altText.length }}/150</div>
    </div>

    <!-- Insert button -->
    <div class="insert-section">
      <button class="insert-btn" :disabled="!hasFiles" @click="insertImages">Insert</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'navigate-to': [page: string]
  action: [action: string, data?: Record<string, unknown>]
}>()

const fileInput = ref<HTMLInputElement>()
const altText = ref(
  "Alt text should be a long-form description of what's visually represented in your ad.",
)
const hasFiles = ref(false)
const uploadedFiles = ref<File[]>([])

const goBackToEditor = () => {
  emit('navigate-to', 'edit')
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFiles = (files: File[]) => {
  uploadedFiles.value = files
  hasFiles.value = files.length > 0

  emit('action', 'uploadFiles', {
    files,
    altText: altText.value,
  })
}

const insertImages = () => {
  if (uploadedFiles.value.length > 0) {
    emit('action', 'insertImages', {
      files: uploadedFiles.value,
      altText: altText.value,
    })
    emit('navigate-to', 'edit')
  }
}
</script>

<style scoped>
.upload-images {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.page-header {
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn:hover {
  text-decoration: underline;
}

.back-arrow {
  font-size: 16px;
}

.page-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #5f6368;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-area {
  border: 2px dashed #dadce0;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #1a73e8;
  background: #f1f6ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 4px;
}

.upload-subtitle {
  font-size: 14px;
  color: #5f6368;
}

.upload-constraints {
  margin-top: 12px;
  padding-left: 8px;
}

.constraint {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
}

.alt-text-section {
  margin-bottom: 24px;
}

.alt-text-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
}

.alt-text-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  color: #202124;
  resize: vertical;
  font-family: inherit;
}

.alt-text-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 1px #1a73e8;
}

.alt-text-placeholder {
  margin-top: 8px;
  font-size: 12px;
  color: #5f6368;
  font-style: italic;
}

.character-count {
  margin-top: 4px;
  font-size: 12px;
  color: #5f6368;
  text-align: right;
}

.insert-section {
  margin-top: auto;
}

.insert-btn {
  width: 100%;
  padding: 12px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.insert-btn:hover:not(:disabled) {
  background: #1557b0;
}

.insert-btn:disabled {
  background: #dadce0;
  color: #9aa0a6;
  cursor: not-allowed;
}
</style>
