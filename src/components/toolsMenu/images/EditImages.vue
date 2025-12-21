<!-- tools/images/EditImages.vue -->
<template>
  <div class="tool-menu">
    <!-- Edit Screen -->
    <template v-if="control.currentScreen.value === 'edit'">
      <!-- Page header -->
      <h3 class="menu-title">Edit main image</h3>
      <p class="menu-subtitle">Across ad sizes</p>
      <PreviewImage
        :current-image="control.currentImage.value"
        :current-image-id="control.currentImageId.value || ''"
        :has-image="control.hasImage.value"
        :preview-buttons="control.previewButtons.value"
        :is-focus-mode="control.isFocusMode.value"
        :alt-text="control.altText.value"
        @button-click="control.handleButtonClick"
        @update:alt-text="handleAltTextUpdate"
      />

      <div class="action-buttons">
        <button @click="control.handleAddImage" class="btn-add-image">Add Image</button>
      </div>
    </template>

    <!-- Change Screen -->
    <ChangeImages v-else-if="control.currentScreen.value === 'change'" />

    <!-- Upload Screen -->
    <UploadImages v-else-if="control.currentScreen.value === 'upload'" />
  </div>
</template>

<script setup lang="ts">
import PreviewImage from './PreviewImage.vue'
import ChangeImages from './ChangeImages.vue'
import UploadImages from './UploadImages.vue'
import { useEditImagesControl } from './useEditImagesControl'

// 🎮 Get all the logic from clean composable
const control = useEditImagesControl()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
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

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.btn-add-image {
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

.btn-add-image:hover {
  background: #212529;
  color: white;
}
</style>
