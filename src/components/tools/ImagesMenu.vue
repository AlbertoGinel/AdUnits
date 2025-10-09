<template>
  <div class="images-menu">
    <div v-if="currentView === 'main'" class="images-main">
      <div class="section-header">
        <h5>My Images</h5>
      </div>

      <div class="images-grid">
        <div v-for="image in images" :key="image.id" class="image-item">
          <img :src="image.thumbnail" :alt="image.name" />
          <div class="image-overlay">
            <button class="insert-btn" @click="insertImage(image)">Insert</button>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button class="add-images-btn" @click="showUpload">
          <span class="icon">📁</span>
          Add Images
        </button>
      </div>
    </div>

    <div v-else-if="currentView === 'upload'" class="upload-section">
      <div class="section-header">
        <button class="back-btn" @click="showMain">← Back</button>
        <h5>Upload Images</h5>
      </div>

      <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
        <div class="upload-content">
          <span class="upload-icon">📤</span>
          <p>Drop images here or click to browse</p>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            multiple
            accept="image/*"
            style="display: none"
          />
          <button class="browse-btn" @click="triggerFileInput">Browse Files</button>
        </div>
      </div>

      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <h6>Ready to Insert:</h6>
        <div class="files-list">
          <div v-for="file in uploadedFiles" :key="file.name" class="file-item">
            <img :src="file.preview" :alt="file.name" />
            <span class="file-name">{{ file.name }}</span>
            <button class="remove-file" @click="removeFile(file)">×</button>
          </div>
        </div>
        <button class="insert-all-btn" @click="insertAllFiles">Insert All Images</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ImageItem = {
  id: string
  name: string
  thumbnail: string
  url: string
}

type UploadedFile = {
  name: string
  preview: string
  file: File
}

const currentView = ref<'main' | 'upload'>('main')
const images = ref<ImageItem[]>([
  {
    id: '1',
    name: 'Sample Image 1',
    thumbnail: 'https://via.placeholder.com/150x100/4CAF50/white?text=Sample+1',
    url: 'https://via.placeholder.com/800x600/4CAF50/white?text=Sample+1',
  },
  {
    id: '2',
    name: 'Sample Image 2',
    thumbnail: 'https://via.placeholder.com/150x100/2196F3/white?text=Sample+2',
    url: 'https://via.placeholder.com/800x600/2196F3/white?text=Sample+2',
  },
])

const uploadedFiles = ref<UploadedFile[]>([])

const showMain = () => {
  currentView.value = 'main'
}

const showUpload = () => {
  currentView.value = 'upload'
}

const insertImage = (image: ImageItem) => {
  console.log('Inserting image:', image)
  // Implementation for inserting image into canvas
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    handleFiles(Array.from(input.files))
  }
}

const handleFiles = (files: File[]) => {
  files.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedFiles.value.push({
          name: file.name,
          preview: e.target?.result as string,
          file,
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeFile = (fileToRemove: UploadedFile) => {
  const index = uploadedFiles.value.indexOf(fileToRemove)
  if (index > -1) {
    uploadedFiles.value.splice(index, 1)
  }
}

const triggerFileInput = () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  input?.click()
}

const insertAllFiles = () => {
  console.log('Inserting all files:', uploadedFiles.value)
  uploadedFiles.value = []
  currentView.value = 'main'
}
</script>

<style scoped>
.images-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h5,
.section-header h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.images-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.images-grid {
  flex: 1;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  overflow-y: auto;
}

.image-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: #4caf50;
  transform: translateY(-2px);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.insert-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 500;
}

.action-section {
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.add-images-btn {
  width: 100%;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.add-images-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-area {
  margin: 16px 20px;
  padding: 40px 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #4caf50;
  background: #f8fff8;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 2rem;
}

.upload-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.browse-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.uploaded-files {
  flex: 1;
  padding: 0 20px 20px;
  overflow-y: auto;
}

.uploaded-files h6 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
}

.file-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-name {
  flex: 1;
  font-size: 0.8rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  background: #f44336;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insert-all-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
}
</style>
