<template>
  <div class="change-image">
    <!-- Header with back button -->
    <div class="page-header">
      <button class="back-btn" @click="goBackToEditor">
        <span class="back-arrow">←</span>
        Back to image editor
      </button>
      <h3>Change image</h3>
      <p>Across ad sizes</p>
    </div>

    <!-- Current image section -->
    <div class="current-image-section">
      <div class="lifestyle-label">Lifestyle photo</div>
      <div class="current-image">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5DdXJyZW50IEltYWdlPC90ZXh0Pgo8L3N2Zz4="
          alt="Current image"
        />
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

    <!-- Uploads section -->
    <div class="uploads-section">
      <h4>Uploads</h4>
      <div class="uploads-grid">
        <div
          v-for="upload in uploads"
          :key="upload.id"
          class="upload-item"
          :class="{ selected: selectedImage?.id === upload.id }"
          @click="selectImage(upload)"
        >
          <img :src="upload.src" :alt="upload.name" />
          <div class="upload-name">{{ upload.name }}</div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button class="upload-btn" @click="goToUpload">
        <span class="upload-icon">⬆</span>
        Upload
      </button>
      <button class="insert-btn" :disabled="!selectedImage" @click="insertSelectedImage">
        Insert
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Upload {
  id: number
  name: string
  src: string
}

const emit = defineEmits<{
  'navigate-to': [page: string]
  action: [action: string, data?: Record<string, unknown>]
}>()

const altText = ref(
  "Alt text should be a long-form description of what's visually represented in your ad.",
)
const selectedImage = ref<Upload | null>(null)

// Mock uploaded images
const uploads = ref<Upload[]>([
  {
    id: 1,
    name: 'tires.jpg',
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiI+VGlyZTwvdGV4dD4KPC9zdmc+',
  },
  {
    id: 2,
    name: 'gy-offroad.jpg',
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiI+T2ZmUm9hZDwvdGV4dD4KPC9zdmc+',
  },
  {
    id: 3,
    name: 'gy-rain.jpg',
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ0NyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiI+UmFpbjwvdGV4dD4KPC9zdmc+',
  },
])

const goBackToEditor = () => {
  emit('navigate-to', 'edit')
}

const goToUpload = () => {
  emit('navigate-to', 'upload')
}

const selectImage = (upload: Upload) => {
  selectedImage.value = selectedImage.value?.id === upload.id ? null : upload

  emit('action', 'selectImage', {
    image: selectedImage.value,
  })
}

const insertSelectedImage = () => {
  if (selectedImage.value) {
    emit('action', 'changeMainImage', {
      image: selectedImage.value,
      altText: altText.value,
    })
    emit('navigate-to', 'edit')
  }
}
</script>

<style scoped>
.change-image {
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

.current-image-section {
  margin-bottom: 24px;
}

.lifestyle-label {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 8px;
}

.current-image {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8eaed;
  padding: 8px;
}

.current-image img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
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
  min-height: 60px;
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

.uploads-section {
  flex: 1;
  margin-bottom: 24px;
}

.uploads-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.upload-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #f8f9fa;
}

.upload-item:hover {
  border-color: #dadce0;
}

.upload-item.selected {
  border-color: #1a73e8;
  box-shadow: 0 0 0 1px #1a73e8;
}

.upload-item img {
  width: 100%;
  height: 60px;
  object-fit: cover;
}

.upload-name {
  padding: 8px;
  font-size: 11px;
  color: #5f6368;
  text-align: center;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.upload-btn {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f8f9fa;
}

.upload-icon {
  font-size: 14px;
}

.insert-btn {
  flex: 1;
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
