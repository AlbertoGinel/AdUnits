<!-- tools/images/EditImages.vue -->
<template>
  <div class="tool-menu">
    <h3 class="menu-title">Edit main image</h3>
    <p class="menu-subtitle">Across ad sizes</p>

    <div class="image-section">
      <h4 class="section-title">Lifestyle photo</h4>
      <div class="image-preview">
        <img :src="lifeStyleImage" alt="Lifestyle photo" class="preview-image" />
        <div class="image-actions">
          <button v-if="!isCropping" class="btn-change" @click="handleStartCrop">Crop</button>
          <button v-else class="btn-save" @click="handleSaveCrop">Save Crop</button>
          <button v-if="isCropping" class="btn-cancel" @click="handleCancelCrop">Cancel</button>
        </div>
      </div>
    </div>

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

    <!-- Upload Images Section -->
    <UploadImages :show="true" @insert="handleInsertImage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import UploadImages from './UploadImages.vue'

const { isCropping, startCrop, applyCrop, cancelCrop } = useCropping()
const { getImage } = useImageManager()

const altText = ref('')

// Get the lifestyle image from store (with fallback)
const lifeStyleImage = computed(() => {
  const imageData = getImage('lifeStyle')
  return imageData?.url || ''
})

const handleStartCrop = () => {
  startCrop()
}

const handleSaveCrop = () => {
  applyCrop()
}

const handleCancelCrop = () => {
  cancelCrop()
}

const handleInsertImage = (imageId: string) => {
  console.log('Insert image:', imageId)
  // TODO: Apply uploaded image to current element
}
</script>

<!-- filepath: c:\AlbertosProjects\banner-editor\src\components\toolsMenu\images\EditImages.vue -->
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

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.image-preview {
  position: relative; /* ← Added this! */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 12px;
  z-index: 10; /* ← Added this to ensure buttons are on top */
}

.btn-change,
.btn-save,
.btn-cancel,
.btn-more {
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.btn-change:hover,
.btn-save:hover,
.btn-cancel:hover,
.btn-more:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-cancel:hover {
  background: #c82333;
}

.btn-more {
  width: 40px;
  padding: 10px;
  font-size: 18px;
  line-height: 1;
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
  font-size: 12px;
  color: #6c757d;
  text-align: right;
}
</style>
