<template>
  <div class="uploads-section">
    <h4 class="text-caption.text-caption--medium">Uploads</h4>

    <!-- Uploaded Images Grid -->
    <div class="uploads-grid">
      <div
        v-for="upload in libraryImagesFormatted.slice().reverse()"
        :key="upload.imageID"
        class="upload-item"
        @click="selectImage(upload.imageID)"
      >
        <div
          class="thumbnail-container"
          :class="{ selected: selectedLibraryImageId === upload.imageID }"
        >
          <img
            v-if="upload.image"
            :src="upload.image.src"
            :alt="upload.name"
            class="upload-thumbnail"
          />
          <div v-else class="upload-placeholder">Loading...</div>

          <!-- Custom check mark for selected items -->
          <div
            v-if="selectedLibraryImageId === upload.imageID"
            class="check-mark"
            v-html="getIcon('check')"
          ></div>
        </div>
        <span class="upload-name">{{ upload.name || upload.imageID }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="goToUploadAsset()" class="button-action upload">
        Upload <span v-html="getIcon('addCircle')"></span>
      </button>
      <button
        @click="applySelectedImage()"
        :disabled="!selectedLibraryImageId"
        class="button-action insert"
      >
        Insert
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditAssets } from './useEditAsset'
import { useIcons } from '@/features/utils/useIcons'

const {
  libraryImagesFormatted,
  selectedLibraryImageId,
  selectImage,
  applySelectedImage,
  goToUploadAsset,
} = useEditAssets()
const { getIcon } = useIcons()
</script>

<style scoped>
.uploads-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  cursor: pointer;
}

.thumbnail-container {
  position: relative;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
}

.thumbnail-container.selected {
  border-radius: 10px;
  border: 1px solid var(--color-turquoise);
}

.thumbnail-container:hover {
  border: 0.5px solid var(--color-border-dark);
}

.check-mark {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  background: var(--color-primary-blue);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 9px;
}

.upload-thumbnail {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

.upload-placeholder {
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 10px;
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
</style>
