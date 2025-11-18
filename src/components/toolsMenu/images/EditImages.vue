<!-- tools/images/EditImages.vue -->
<template>
  <div class="tool-menu">
    <h3 class="menu-title">Edit main image</h3>
    <p class="subtitle">Across ad sizes</p>

    <!-- Image preview section -->
    <div class="image-section">
      <h4 class="section-title">Lifestyle photo</h4>

      <div class="image-preview">
        <img
          v-if="currentImage"
          :src="currentImage"
          alt="Lifestyle photo preview"
          class="preview-image"
        />
        <div v-else class="no-image">
          <span class="icon">🖼️</span>
          <p>No image selected</p>
        </div>

        <div class="image-actions">
          <button class="btn-change" @click="handleChangeImage">Change</button>
          <button class="btn-crop" @click="handleCropImage">Crop</button>
          <button class="btn-more" @click="handleMoreOptions">⋯</button>
        </div>
      </div>
    </div>

    <!-- Alt text section -->
    <div class="alt-text-section">
      <h4 class="section-title">Alt text*</h4>
      <p class="description">
        Alt text should be a long-form description of what's visually represented in your ad.
      </p>

      <input
        v-model="altText"
        type="text"
        class="alt-text-input"
        placeholder="Image's alternate text goes here"
      />

      <div class="character-count">Character count: {{ altText.length }}/150</div>
    </div>

    <hr class="divider" />

    <!-- Add images button -->
    <button class="btn-add-images" @click="handleAddImages">
      <span class="icon">⊕</span>
      Add images
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Temporary state - will be connected to composables later
const currentImage = ref<string | null>(null)
const altText = ref('')

const handleChangeImage = () => {
  console.log('Change image clicked')
  // TODO: Implement image picker
}

const handleCropImage = () => {
  console.log('Change image clicked')
  // TODO: Implement image picker
}

const handleMoreOptions = () => {
  console.log('More options clicked')
  // TODO: Implement more options menu
}

const handleAddImages = () => {
  console.log('Add images clicked')
  // TODO: Implement add images functionality
}
</script>

<style scoped>
.tool-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: -8px 0 0 0;
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
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.no-image .icon {
  font-size: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-image p {
  margin: 0;
  font-size: 14px;
}

.image-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.btn-change,
.btn-crop .btn-more {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-change {
  background: white;
  color: #212529;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-change:hover {
  background: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-more {
  background: white;
  color: #212529;
  padding: 8px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-more:hover {
  background: #f8f9fa;
}

.alt-text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.alt-text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.alt-text-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.character-count {
  font-size: 11px;
  color: #6c757d;
  text-align: right;
}

.divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 8px 0;
}

.btn-add-images {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #007bff;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-images:hover {
  background: #007bff;
  color: white;
}

.btn-add-images .icon {
  font-size: 18px;
  font-weight: bold;
}
</style>
