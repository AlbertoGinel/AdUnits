<!-- components/toolsMenu/images/UploadLibrary.vue -->
<template>
  <div v-if="show" class="uploads-section">
    <h4 class="section-title">{{ type === 'logo' ? 'Logos' : 'Images' }}</h4>

    <!-- Uploaded Images Grid -->
    <div class="uploads-grid">
      <div
        v-for="upload in images"
        :key="upload.id"
        class="upload-item"
        :class="{ selected: selectedImageId === upload.id }"
        @click="selectImage(upload.id)"
      >
        <img
          v-if="upload.image"
          :src="upload.image.src"
          :alt="upload.name"
          class="upload-thumbnail"
        />
        <div v-else class="upload-placeholder">Loading...</div>
        <span class="upload-name">{{ upload.name || upload.id }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="$emit('upload-requested')" class="btn-upload">
        Upload {{ type === 'logo' ? 'Logo' : 'Image' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ImageItem {
  id: string
  name: string
  image: HTMLImageElement
}

interface Props {
  show: boolean
  type: 'image' | 'logo'
  images: ImageItem[]
  selectedImageId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  selectedImageId: null,
})

const emit = defineEmits<{
  'image-selected': [imageId: string]
  'upload-requested': []
  'insert-requested': [imageId: string]
}>()

// Use prop for selected state, but maintain local ref for UI responsiveness
const selectedImageId = ref<string | null>(props.selectedImageId)

const selectImage = (id: string) => {
  const newSelection = selectedImageId.value === id ? null : id
  selectedImageId.value = newSelection

  if (newSelection) {
    emit('image-selected', newSelection)
  }
}
</script>

<style scoped>
.uploads-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
}

.upload-item:hover {
  border-color: #dee2e6;
}

.upload-item.selected {
  border-color: #007bff;
  background: #e7f3ff;
  position: relative;
}

.upload-item.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.upload-thumbnail {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 8px;
}

.upload-placeholder {
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 8px;
  font-size: 12px;
  color: #6c757d;
}

.upload-name {
  font-size: 12px;
  color: #495057;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  /* ellipsis */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #212529;
  border-radius: 24px;
  color: #212529;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #212529;
  color: white;
}

.btn-upload .icon {
  font-size: 20px;
  line-height: 1;
}

.btn-insert {
  padding: 12px 32px;
  background: #007bff;
  border: none;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-insert:hover:not(:disabled) {
  background: #0056b3;
}

.btn-insert:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
