<template>
  <div class="images-page-1">
    <div class="page-header">
      <h5>📁 My Images</h5>
      <p>Manage your image library</p>
    </div>

    <div class="page-content">
      <!-- Search input -->
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search images..."
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <!-- Image library -->
      <div class="images-grid">
        <div 
          v-for="image in filteredImages" 
          :key="image.id"
          class="image-item"
          @click="selectImage(image)"
        >
          <div class="image-preview">
            <span class="image-icon">🖼️</span>
          </div>
          <div class="image-name">{{ image.name }}</div>
        </div>

        <!-- Add new image -->
        <div class="image-item add-new" @click="openUpload">
          <div class="image-preview">
            <span class="add-icon">➕</span>
          </div>
          <div class="image-name">Add Image</div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="page-footer">
      <button class="nav-button primary" @click="$emit('next-page')">
        <span>Upload Images</span>
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ImageData {
  id: number
  name: string
  type: string
}

const emit = defineEmits<{
  'next-page': []
  action: [action: string, data?: Record<string, unknown>]
}>()

const searchQuery = ref('')

// Mock image data
const images = ref<ImageData[]>([
  { id: 1, name: 'Logo.png', type: 'logo' },
  { id: 2, name: 'Background.jpg', type: 'background' },
  { id: 3, name: 'Product.png', type: 'product' },
  { id: 4, name: 'Hero.jpg', type: 'hero' },
])

const filteredImages = computed(() => {
  if (!searchQuery.value) return images.value
  return images.value.filter(img => 
    img.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSearch = () => {
  emit('action', 'search', { query: searchQuery.value })
}

const selectImage = (image: ImageData) => {
  emit('action', 'selectImage', { image })
}

const openUpload = () => {
  emit('action', 'openUpload')
}
</script>

<style scoped>
.images-page-1 {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.page-header h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-top: 16px;
  flex: 1;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: #0066cc;
  background: #f8f9fa;
}

.image-item.add-new {
  border-style: dashed;
  color: #666;
}

.image-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.image-icon {
  font-size: 24px;
}

.add-icon {
  font-size: 20px;
  color: #0066cc;
}

.image-name {
  font-size: 11px;
  text-align: center;
  word-break: break-word;
}

.page-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.nav-button {
  width: 100%;
  padding: 12px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.nav-button:hover {
  background: #0052a3;
}

.arrow {
  font-size: 16px;
}
</style>