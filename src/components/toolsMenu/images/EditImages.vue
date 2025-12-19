<!-- tools/images/EditImages.vue -->
<template>
  <div class="tool-menu">
    <!-- Show message if no image in focus mode -->
    <div v-if="isFocusMode && !hasImage" class="no-elements-message">
      <p>This ad unit does not contain an image element.</p>
    </div>

    <!-- Normal image editing content -->
    <template v-else>
      <h3 class="menu-title">Edit main image</h3>
      <p class="menu-subtitle">Across ad sizes</p>

      <div class="image-section">
        <h4 class="section-title">Lifestyle photo</h4>
        <div class="image-preview">
          <img :src="currentImage" alt="Lifestyle photo" class="preview-image" />
          <div class="image-actions">
            <button
              v-for="button in previewButtons"
              :key="button.id"
              :class="button.class"
              :disabled="button.disabled"
              @click="handleButtonClick(button.action)"
            >
              {{ button.label }}
            </button>
          </div>
        </div>
        <LockedInfo
          v-if="selectedLibraryImageId !== null"
          :locked-elements="lockedElementsByTag.image"
          :override-value="overrideStates.imageOverride.value"
          :is-bulk-mode="true"
          field-name="image"
          @update:override-value="overrideStates.imageOverride.value = $event"
        />
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

      <!-- Upload Library Component -->
      <UploadLibrary
        :show="true"
        type="image"
        :images="availableImages"
        :selected-image-id="selectedLibraryImageId"
        @upload-requested="handleNavigate('upload')"
        @image-selected="(id) => (selectedLibraryImageId = id || null)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCropping } from '@/composables/Tools/useCropping'
import { useImageManager } from '@/composables/setupImages/useImageManager'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'
import UploadLibrary from './UploadLibrary.vue'
import LockedInfo from '@/components/toolsMenu/Subcomponets/LockedInfo.vue'

const { startCrop, applyCrop, cancelCrop } = useCropping()
const imageManager = useImageManager()
const { getPreviewButtons, lockedElementsByTag, overrideStates, freeLayer, hasImage } = useTools()
const { getCurrentView } = useCanvasData()

const isFocusMode = computed(() => getCurrentView() === 'focusMode')

const emit = defineEmits<{
  navigate: [subView: string]
}>()

// Track selected library image for button states
const selectedLibraryImageId = ref<string | null>(null)

// Computed preview buttons with context
const previewButtons = computed(() => {
  const currentImageId = imageManager.getCurrentImage()
  const isSameImage = selectedLibraryImageId.value === currentImageId
  const currentView = getCurrentView()

  // In focus mode, disable if same image (no point changing to same)
  // In bulk mode, allow same image (might want to use override to unlock)
  const shouldDisableSameImage = currentView === 'focusMode' && isSameImage

  return getPreviewButtons({
    hasLibrarySelection: !!selectedLibraryImageId.value && !shouldDisableSameImage,
  })
})

// Two-way binding for altText
const altText = computed({
  get: () => {
    const currentImageId = imageManager.getCurrentImage()
    if (!currentImageId) return ''
    const metadata = imageManager.getImageMetadata(currentImageId)
    return metadata?.altText || ''
  },
  set: (value: string) => {
    const currentImageId = imageManager.getCurrentImage()
    if (currentImageId) {
      imageManager.updateImageAltText(currentImageId, value)
    }
  },
})

// Prepare images for UploadLibrary
const availableImages = computed(() => {
  const imageIds = imageManager.getImagesByType('image')

  return imageIds.map((id) => {
    const metadata = imageManager.getImageMetadata(id)
    const imageElement = imageManager.getImageOptimized(id)

    return {
      id,
      name: metadata?.name || id,
      image: imageElement,
    }
  })
})

const currentImage = computed(() => {
  // Get current image ID (context-aware)
  const currentImageId = imageManager.getCurrentImage()

  if (!currentImageId) return ''

  // Get HTMLImageElement and return its src
  const imageElement = imageManager.getImageOptimized(currentImageId)
  return imageElement.src
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
  console.log('Inserting image with ID:', imageId)

  // Check if override is enabled
  if (overrideStates.imageOverride.value) {
    console.log('🔓 Image Override: Unlocking all images and applying cascade')
    freeLayer('image')
    // Reset override checkbox after use
    overrideStates.imageOverride.value = false
  }

  imageManager.setCurrentImage(imageId)
}

const handleButtonClick = (action: string) => {
  // Route button actions to appropriate handlers
  switch (action) {
    case 'startCrop':
      handleStartCrop()
      break
    case 'saveCrop':
      handleSaveCrop()
      break
    case 'cancelCrop':
      handleCancelCrop()
      break
    case 'changeImage':
      if (selectedLibraryImageId.value) {
        handleInsertImage(selectedLibraryImageId.value)
        selectedLibraryImageId.value = null // Clear selection after use
      }
      break
    default:
      console.warn('Unknown action:', action)
  }
}

const handleNavigate = (subView: string) => {
  // Cancel crop when navigating away
  cancelCrop()
  emit('navigate', subView)
}
</script>

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

.btn-change:disabled,
.btn-save:disabled,
.btn-cancel:disabled,
.btn-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: none;
}

.btn-change:disabled:hover,
.btn-save:disabled:hover,
.btn-cancel:disabled:hover,
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
