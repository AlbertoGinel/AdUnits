<template>
  <div class="edit-main-image">
    <!-- Header -->
    <div class="page-header">
      <h3>Edit main image</h3>
      <p>Across ad sizes</p>
    </div>

    <!-- Main image area -->
    <div class="main-image-section">
      <div class="image-container">
        <div class="lifestyle-label">Lifestyle photo</div>
        <div class="image-preview">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZSBQcmV2aWV3PC90ZXh0Pgo8L3N2Zz4="
            alt="Main image"
            class="preview-image"
          />
          <div class="image-controls">
            <button class="control-btn change-btn" @click="goToChangeImage">Change</button>
            <button class="control-btn more-btn">⋮</button>
          </div>
        </div>
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

    <!-- Add images button -->
    <div class="add-images-section">
      <button class="add-images-btn" @click="goToUpload">
        <span class="add-icon">+</span>
        Add images
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'navigate-to': [page: string]
  action: [action: string, data?: Record<string, unknown>]
}>()

const altText = ref(
  "Alt text should be a long-form description of what's visually represented in your ad.",
)

const goToUpload = () => {
  emit('navigate-to', 'upload')
}

const goToChangeImage = () => {
  emit('navigate-to', 'change')
}
</script>

<style scoped>
.edit-main-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.page-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;
}

.page-header p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #5f6368;
}

.main-image-section {
  margin-bottom: 24px;
}

.image-container {
  position: relative;
}

.lifestyle-label {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 8px;
}

.image-preview {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8eaed;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.change-btn {
  background: white;
  color: #1a73e8;
  border: 1px solid #dadce0;
}

.change-btn:hover {
  background: #f8f9fa;
}

.more-btn {
  background: white;
  color: #5f6368;
  border: 1px solid #dadce0;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn:hover {
  background: #f8f9fa;
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

.add-images-section {
  margin-top: auto;
}

.add-images-btn {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #1a73e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-images-btn:hover {
  background: #f8f9fa;
  border-color: #1a73e8;
}

.add-icon {
  font-size: 16px;
  font-weight: bold;
}
</style>
