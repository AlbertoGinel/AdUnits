<!-- components/toolsMenu/images/UploadImages.vue -->
<template>
  <div v-if="show" class="uploads-section">
    <h4 class="section-title">Uploads</h4>

    <!-- Uploaded Images Grid -->
    <div class="uploads-grid">
      <div
        v-for="upload in uploadedImages"
        :key="upload.id"
        class="upload-item"
        :class="{ selected: selectedImageId === upload.id }"
        @click="selectImage(upload.id)"
      >
        <img :src="upload.url" :alt="upload.name" class="upload-thumbnail" />
        <span class="upload-name">{{ upload.name }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="upload-actions">
      <button class="btn-upload" @click="triggerFileInput">
        <span class="icon">⊕</span>
        Upload
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />

      <button class="btn-insert" :disabled="!selectedImageId" @click="insertSelectedImage">
        Insert
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useImageStore } from '@/stores/useImageStore'

const { uploadImage } = useImageManager()
const imageStore = useImageStore()
const { images } = storeToRefs(imageStore)

const show = defineModel<boolean>('show', { default: false })
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedImageId = ref<string | null>(null)

// Get list of uploaded images reactively from store
const uploadedImages = computed(() => {
  return Object.values(images.value).filter((asset) => asset.isUploaded && asset.image)
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  // Upload each selected file
  for (const file of Array.from(files)) {
    try {
      await uploadImage(file)
      console.log(`✅ Uploaded: ${file.name}`)
      // Force reactivity update
      await nextTick()
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
    }
  }

  // Clear input so same file can be selected again
  input.value = ''
}

const selectImage = (id: string) => {
  selectedImageId.value = selectedImageId.value === id ? null : id
}

const insertSelectedImage = () => {
  if (!selectedImageId.value) return

  // Emit event to parent with selected image ID
  emit('insert', selectedImageId.value)

  // Clear selection
  selectedImageId.value = null
}

const emit = defineEmits<{
  insert: [imageId: string]
}>()
</script>

<style scoped>
.uploads-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
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
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-name {
  font-size: 12px;
  color: #495057;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

.upload-actions {
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
