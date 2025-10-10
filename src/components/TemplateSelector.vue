<template>
  <div class="template-selector">
    <h3>Select Banner Template</h3>

    <div class="template-categories">
      <div v-for="category in templateCategories" :key="category" class="category-section">
        <h4>{{ category.toUpperCase() }}</h4>
        <div class="templates-grid">
          <div
            v-for="template in getTemplatesByCategory(category)"
            :key="template.id"
            class="template-card"
            @click="selectTemplate(template.id)"
          >
            <div class="template-preview">
              <div class="template-dimensions">
                {{ template.dimensions.width }}x{{ template.dimensions.height }}
              </div>
              <div class="template-elements">
                {{ Object.keys(template.elements).length }} elements
              </div>
            </div>
            <div class="template-info">
              <h5>{{ template.name }}</h5>
              <p>{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentBanner" class="current-banner">
      <h4>Current Banner: {{ currentBanner.name }}</h4>
      <p>Template: {{ getTemplate(currentBanner.templateId)?.name }}</p>
      <p>Elements: {{ Object.keys(allElements).length }}</p>

      <div class="banner-actions">
        <button @click="exportCurrentBanner" class="export-btn">Export Banner</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBannerStore } from '@/stores/banners'

const bannerStore = useBannerStore()

// Initialize the store
bannerStore.initializeStore()

const templateCategories = computed(() => bannerStore.templateCategories)
const currentBanner = computed(() => bannerStore.currentBanner)
const allElements = computed(() => bannerStore.allElements)

const getTemplatesByCategory = (category: string) => {
  return bannerStore.getTemplatesByCategory(category)
}

const getTemplate = (templateId: string) => {
  return bannerStore.getTemplate(templateId)
}

const selectTemplate = (templateId: string) => {
  bannerStore.createBannerFromTemplate(templateId)
}

const exportCurrentBanner = () => {
  const exported = bannerStore.exportBanner()
  console.log('Exported banner:', exported)

  // Create download
  const blob = new Blob([exported], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${currentBanner.value?.name || 'banner'}.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.template-selector {
  padding: 20px;
  max-height: 100vh;
  overflow-y: auto;
}

.template-categories {
  margin-bottom: 30px;
}

.category-section {
  margin-bottom: 25px;
}

.category-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.templates-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.template-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.template-card:hover {
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.template-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.8rem;
}

.template-dimensions {
  font-weight: 600;
  color: #555;
}

.template-elements {
  color: #666;
}

.template-info h5 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 0.9rem;
}

.template-info p {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
}

.current-banner {
  border-top: 2px solid #e0e0e0;
  padding-top: 20px;
  margin-top: 20px;
}

.current-banner h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.current-banner p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.banner-actions {
  margin-top: 15px;
}

.export-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background: #218838;
}
</style>
