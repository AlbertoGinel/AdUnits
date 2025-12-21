<!-- components/toolsMenu/images/PreviewImage.vue -->
<template>
  <div class="preview-container">
    <!-- Show message if no image in focus mode -->
    <div v-if="isFocusMode && !hasImage" class="no-elements-message">
      <p>This ad unit does not contain an image element.</p>
    </div>

    <!-- Normal image editing content -->
    <template v-else>
      <div class="image-section">
        <h4 class="section-title">Lifestyle photo</h4>
        <div class="image-preview">
          <SmartImage
            :image-id="currentImageId"
            alt="Lifestyle photo"
            class-name="preview-imageElem"
            :show-fallback-text="true"
          />
          <div class="image-actions">
            <button
              v-for="button in previewButtons.filter((btn: any) => btn)"
              :key="button.id"
              :class="button.class"
              :disabled="button.disabled"
              @click="handleButtonClick(button.action)"
            >
              {{ button.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Alt text section (only if altText prop provided) -->
      <div v-if="altText !== undefined" class="alt-text-section">
        <h4 class="section-title">Alt text*</h4>
        <p class="section-description">
          Alt text should be a long-form description of what's visually represented in your ad.
        </p>
        <input
          :value="altText"
          @input="updateAltText(($event.target as HTMLInputElement)?.value || '')"
          type="text"
          class="alt-text-input"
          placeholder="Image's alternate text goes here"
          maxlength="150"
        />
        <div class="character-count">Character count: {{ altText?.length || 0 }}/150</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/composables/setupImages/SmartImage.vue'

interface Props {
  // 📷 Basic image display data
  currentImage: string
  currentImageId: string
  isFocusMode: boolean
  hasImage: boolean
  altText?: string

  // 🔘 Button configuration
  previewButtons: Array<{
    id: string
    class: string
    label: string
    action: string
    disabled?: boolean
  }>
}

defineProps<Props>()

const emit = defineEmits<{
  'button-click': [action: string]
  'update:altText': [value: string]
}>()

// 🎯 Simple handlers - emit events
const handleButtonClick = (action: string) => {
  emit('button-click', action)
}

const updateAltText = (value: string) => {
  emit('update:altText', value)
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-imageElem {
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
  z-index: 10;
}

.btn-change,
.btn-save,
.btn-cancel,
.btn-remove,
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
.btn-remove:hover,
.btn-more:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.btn-change:disabled,
.btn-save:disabled,
.btn-cancel:disabled,
.btn-remove:disabled,
.btn-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: none;
}

.btn-change:disabled:hover,
.btn-save:disabled:hover,
.btn-cancel:disabled:hover,
.btn-remove:disabled:hover,
.btn-more:disabled:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: none;
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

.btn-remove {
  background: #dc3545;
  color: white;
}

.btn-remove:hover {
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

.no-elements-message {
  padding: 24px;
  text-align: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-elements-message p {
  margin: 0;
  font-size: 14px;
}
</style>
