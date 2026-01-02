<!-- components/toolsMenu/images/UploadLibrary.vue -->
<template>
  <div v-if="show" class="uploads-section">
    <h4 class="text-caption.text-caption--medium">Uploads</h4>

    <!-- Uploaded Images Grid -->
    <div class="uploads-grid">
      <div
        v-for="upload in images"
        :key="upload.id"
        class="upload-item"
        @click="selectImage(upload.id)"
      >
        <div class="thumbnail-container" :class="{ selected: props.selectedImageId === upload.id }">
          <img
            v-if="upload.image"
            :src="upload.image.src"
            :alt="upload.name"
            class="upload-thumbnail"
          />
          <div v-else class="upload-placeholder">Loading...</div>

          <!-- Custom check mark for selected items -->
          <div
            v-if="props.selectedImageId === upload.id"
            class="check-mark"
            v-html="getIcon('check')"
          ></div>
        </div>
        <span class="upload-name">{{ upload.name || upload.id }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="$emit('upload-requested')" class="button-action upload">
        Upload <span v-html="getIcon('addCircle')"></span>
      </button>
      <button
        v-if="showInsertButton"
        @click="props.selectedImageId && $emit('insert-requested', props.selectedImageId)"
        :disabled="!props.selectedImageId"
        class="button-action insert"
      >
        Insert
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/utils/useIcons'

const { getIcon } = useIcons()

interface ImageItem {
  id: string
  name: string
  image: HTMLImageElement
}

interface Props {
  show: boolean
  type: 'image' | 'logo'
  images: ImageItem[]
  selectedImageId?: string | null
  showInsertButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  selectedImageId: null,
  showInsertButton: false,
})

const emit = defineEmits<{
  'image-selected': [imageId: string | null]
  'upload-requested': []
  'insert-requested': [imageId: string]
}>()

const selectImage = (id: string) => {
  const newSelection = props.selectedImageId === id ? null : id
  emit('image-selected', newSelection)
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
