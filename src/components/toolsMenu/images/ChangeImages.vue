<!-- tools/images/ChangeImages.vue -->
<template>
  <div>
    <button @click="control.currentScreen.value = 'edit'" class="btn-secondary">Cancel</button>
    <h3 class="menu-title">Change image</h3>
    <p class="menu-subtitle">Across ad sizes</p>

    <PreviewImage
      :current-image="control.currentImage.value"
      :has-image="control.hasImage.value"
      :preview-buttons="control.previewButtons.value"
      :is-focus-mode="control.isFocusMode.value"
      :alt-text="control.altText.value"
      @button-click="control.handleButtonClick"
      @update:alt-text="handleAltTextUpdate"
    />

    <UploadLibrary
      :show="true"
      type="image"
      :images="control.availableImages.value"
      :selected-image-id="control.selectedLibraryImageId.value"
      :show-insert-button="true"
      @upload-requested="control.handleAddImage"
      @image-selected="control.handleImageSelected"
      @insert-requested="control.handleInsertRequested"
    />
  </div>
</template>

<script setup lang="ts">
import PreviewImage from './PreviewImage.vue'
import UploadLibrary from './UploadLibrary.vue'
import { useEditImagesControl } from './useEditImagesControl'

// 🎮 Use shared composable instance
const control = useEditImagesControl()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
}
</script>
