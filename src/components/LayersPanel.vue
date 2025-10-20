<template>
  <div class="layers-panel">
    <!-- Simple layer buttons for AdUnits -->
    <div class="layers-list">
      <button
        v-for="layerData in adUnitsStore.layerStructure"
        :key="layerData.layer"
        class="layer-button"
        :class="{ active: hoveredLayer === layerData.layer }"
        @click="handleLayerClick(layerData.layer)"
        @mouseenter="handleLayerHover(layerData.layer)"
        @mouseleave="handleLayerLeave"
      >
        <span class="tool-icon">{{ getLayerIcon(layerData.layer) }}</span>
        <span class="layer-name">{{ layerData.layer }}</span>
        <span class="adunit-count">{{ layerData.adUnitRefs.length }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdUnitsStore } from '@/stores/adUnits'

const adUnitsStore = useAdUnitsStore()
const hoveredLayer = ref<string | null>(null)

// Layer icons mapping for AdUnits
const getLayerIcon = (layer: string): string => {
  const icons: Record<string, string> = {
    headline: '�',
    subhead: '📝',
    cta: '🔘',
    images: '🖼️',
  }
  return icons[layer] || '🔧'
}

// Handle layer click - for AdUnits, just show info (no selection needed)
const handleLayerClick = (layerName: string) => {
  console.log(`AdUnit layer clicked: ${layerName}`)
  // For AdUnits, we could implement layer-specific actions here
  // For now, just log the action
}

// Handle layer hover - highlight all elements of this layer
const handleLayerHover = (layerName: string) => {
  hoveredLayer.value = layerName
  // TODO: Add highlighting logic here later
  console.log('🎯 Hovering layer:', layerName)
}

// Handle layer leave - clear highlights
const handleLayerLeave = () => {
  hoveredLayer.value = null
  // TODO: Clear highlighting logic here later
  console.log('🎯 Left layer')
}
</script>

<style scoped>
.layers-panel {
  width: 200px;
  height: 100%;
  background: white;
  border-left: 1px solid #eee;
  padding: 16px;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
}

.layer-button:hover {
  background: #e8f4fd;
  border-color: #0066cc;
  transform: translateY(-1px);
}

.layer-button.active {
  background: #0066cc;
  border-color: #0066cc;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
}

.tool-icon {
  font-size: 16px;
  min-width: 20px;
}

.layer-name {
  font-weight: 500;
  text-transform: capitalize;
}

.adunit-count {
  background: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}

.layer-button.active .layer-name {
  color: white;
}

.layer-button.active .adunit-count {
  background: rgba(255, 255, 255, 0.2);
}
</style>
