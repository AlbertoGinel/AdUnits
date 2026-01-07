<template>
  <div class="canvas-area">
    <!-- Title Section -->
    <div class="title-section">
      <h3 class="canvas-title">Canvas</h3>
      <select class="zoom-dropdown">
        <option value="100">100%</option>
        <option value="75">75%</option>
        <option value="50">50%</option>
        <option value="25">25%</option>
        <option value="fit">Fit</option>
      </select>
    </div>

    <!-- File Background Section -->
    <div class="file-background-section">
      <h4 class="section-title">File background</h4>
      <div class="background-controls">
        <input type="text" value="EDF4F7" class="hex-input" placeholder="EDF4F7" />
      </div>
    </div>

    <!-- Layers Section -->
    <div class="layers-section">
      <h4 class="section-title">Layers</h4>
      <div class="layers-list">
        <LayerItem
          v-for="layer in layersList"
          :key="layer.id"
          :icon-name="layer.iconName"
          :name="layer.name"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LayerItem from './LayerItem.vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import type { IconName } from '@/composables/utils/useIcons'

const canvasData = useCanvasData()

// Mapping for layer IDs to display names and icons
const layerMapping: Record<string, { name: string; iconName: IconName }> = {
  headline: { name: 'Headline', iconName: 'textTool' },
  logo: { name: 'Logo', iconName: 'logoTool' },
  subhead: { name: 'Subheadline', iconName: 'textTool' },
  cta: { name: 'CTA', iconName: 'textTool' },
  image: { name: 'Image', iconName: 'imageTool' },
  disclaimer: { name: 'Disclaimer Text', iconName: 'textTool' },
  disclaimerBG: { name: 'Disclaimer BG', iconName: 'vectorialCursor' },
}

// Dynamic layers list based on current view mode
const layersList = computed(() => {
  const currentView = canvasData.getCurrentView()

  if (currentView === 'bulkMode') {
    // Bulk mode: show layers from store
    const layers = canvasData.getLayers()
    return Object.entries(layers)
      .filter(([id]) => layerMapping[id]) // Filter out unmapped layers
      .map(([id]) => {
        const mapping = layerMapping[id]!
        return {
          id,
          name: mapping.name,
          iconName: mapping.iconName,
        }
      })
  } else {
    // Focus mode: show elements from current ad unit
    const currentAdUnitId = canvasData.getCurrentAdUnitId()
    if (!currentAdUnitId) return []

    const elements = canvasData.getAdUnitElements(currentAdUnitId)
    return elements
      .filter((element) => element.tag && layerMapping[element.tag]) // Filter out elements without valid tags
      .map((element) => {
        const mapping = layerMapping[element.tag!]!
        return {
          id: element.tag!,
          name: mapping.name,
          iconName: mapping.iconName,
        }
      })
  }
})
</script>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-family: 'Everyday Sans', sans-serif;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e5e9;
}

.canvas-title {
  font-size: 18px;
  font-weight: 700;
  color: #001e60;
  margin: 0;
}

.zoom-dropdown {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #333;
}

.file-background-section {
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e5e9;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.background-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hex-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  background-color: white;
}

.hex-input:focus {
  outline: none;
  border-color: #001e60;
  box-shadow: 0 0 0 2px rgba(0, 30, 96, 0.1);
}

.percentage-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.percentage-label {
  font-size: 14px;
  color: #666;
}

.eye-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.eye-button:hover {
  background-color: #f0f0f0;
}

.eye-button svg {
  fill: #666;
}

.layers-section {
  flex: 1;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
