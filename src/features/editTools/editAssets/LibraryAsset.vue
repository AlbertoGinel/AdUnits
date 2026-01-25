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
          <!-- Dynamic content based on image loading state -->
          <img
            v-if="getImageUrl(upload.imageID)"
            :src="getImageUrl(upload.imageID) ?? undefined"
            :alt="upload.name"
            class="upload-thumbnail"
          />
          <div v-else class="image-skeleton">
            <div class="skeleton-icon">📷</div>
          </div>

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
import { useImageStore } from '@/data/stores/useImageStore'
import { useIcons } from '@/features/utils/useIcons'

const {
  libraryImagesFormatted,
  selectedLibraryImageId,
  selectImage,
  applySelectedImage,
  goToUploadAsset,
} = useEditAssets()
const { getIcon } = useIcons()
const imageStore = useImageStore()

// Get URL for each library image from store
const getImageUrl = (imageID: string): string | null => {
  const image = imageStore.getImage(imageID)
  return image?.url || null
}
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

.upload-placeholder,
.image-skeleton {
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 12px;
  color: #6c757d;
}

.upload-placeholder {
  background: #e9ecef;
}

.image-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  position: relative;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.image-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: inherit;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.skeleton-icon {
  font-size: 1.5rem;
  color: #c0c0c0;
  z-index: 1;
  opacity: 0.6;
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
