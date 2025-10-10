<template>
  <div class="images-page-2">
    <div class="page-header">
      <h5>📤 Upload Images</h5>
      <p>Add new images to your library</p>
    </div>

    <div class="page-content">
      <!-- Upload area -->
      <div class="upload-area" @click="triggerUpload" @drop="handleDrop" @dragover.prevent>
        <div class="upload-content">
          <span class="upload-icon">📁</span>
          <h6>Drop images here or click to browse</h6>
          <p>Supports JPG, PNG, GIF up to 10MB</p>
        </div>
        <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect" style="display: none;">
      </div>

      <!-- Upload settings -->
      <div class="upload-settings">
        <label class="setting-item">
          <span>Resize images:</span>
          <input v-model="autoResize" type="checkbox">
        </label>
        
        <label class="setting-item" v-if="autoResize">
          <span>Max width:</span>
          <input v-model="maxWidth" type="number" min="100" max="2000" class="number-input">
        </label>
      </div>
    </div>

    <div class="page-footer">
      <button class="nav-button primary" @click="$emit('next-page')">
        <span>Image Effects</span>
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'next-page': []
  action: [action: string, data?: Record<string, unknown>]
}>()

const fileInput = ref<HTMLInputElement>()
const autoResize = ref(true)
const maxWidth = ref(800)

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
  emit('action', 'uploadFiles', { 
    files, 
    settings: { autoResize: autoResize.value, maxWidth: maxWidth.value }
  })
}
</script>

<style scoped>
.images-page-2 {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #0066cc;
  background: #f8f9fa;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.upload-content h6 {
  margin: 0 0 8px 0;
  color: #333;
}

.upload-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.upload-settings {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  flex: 1;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.number-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.page-header h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.page-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.nav-button {
  width: 100%;
  padding: 12px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
}

.nav-button:hover {
  background: #0052a3;
}

.arrow {
  font-size: 16px;
}
</style>