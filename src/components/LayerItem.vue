<template>
  <div class="layer-item">
    <!-- Layer header for AdUnits -->
    <div class="layer-header">
      <div class="layer-info">
        <span class="tool-icon">{{ getLayerIcon(layerData.layer) }}</span>
        <span class="layer-name">{{ layerData.layer }}</span>
      </div>
      <div class="element-count">{{ layerData.adUnitRefs.length }}</div>
    </div>

    <!-- AdUnit references -->
    <div class="element-refs">
      <div
        v-for="adUnitRef in layerData.adUnitRefs"
        :key="`${adUnitRef.adUnitId}-${adUnitRef.elementType}`"
        class="element-ref"
        @click="showAdUnitInfo(adUnitRef.adUnitId, adUnitRef.elementType)"
      >
        <div class="element-info">
          <span class="element-icon">📱</span>
          <span class="element-name">{{ adUnitRef.adUnitName }}</span>
        </div>
        <span class="element-type">{{ adUnitRef.elementType }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AdUnitLayerData {
  layer: string
  adUnitRefs: Array<{
    adUnitId: string
    adUnitName: string
    elementType: 'headline' | 'subhead' | 'cta' | 'images'
  }>
}

interface Props {
  layerData: AdUnitLayerData
}

defineProps<Props>()

// Layer icon mapping for AdUnits
const getLayerIcon = (layer: string) => {
  const layerIcons = {
    headline: '�',
    subhead: '📝',
    cta: '🔘',
    images: '🖼️',
  }
  return layerIcons[layer as keyof typeof layerIcons] || '❓'
}

// Handle AdUnit info display
const showAdUnitInfo = (adUnitId: string, elementType: string) => {
  console.log(`AdUnit info: ${adUnitId} - ${elementType}`)
  // For AdUnits, we could show detailed info or trigger actions here
}
</script>

<style scoped>
.layer-item {
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-icon {
  font-size: 16px;
}

.layer-name {
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.element-count {
  background: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}

.element-refs {
  background: white;
}

.element-ref {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.element-ref:hover {
  background: #f8f9fa;
}

.element-ref:last-child {
  border-bottom: none;
}

.element-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-icon {
  font-size: 14px;
  opacity: 0.7;
}

.element-name {
  font-size: 13px;
  color: #555;
}

.element-type {
  background: #28a745;
  color: white;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}
</style>
