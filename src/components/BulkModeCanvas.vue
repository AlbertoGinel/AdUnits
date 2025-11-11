<template>
  <div class="bulkmode-canvas">
    <v-stage :config="{ width: 1000, height: 400, pixelRatio: 6 }" :key="renderKey">
      <v-layer>
        <!-- Show ALL ad unit elements -->
        <template v-for="(adUnit, adUnitId) in adUnits" :key="adUnitId">
          <template v-for="(element, elementId) in adUnit.elements" :key="elementId">
            <KonvaText v-if="element.type === 'text'" :element="{ ...element, id: elementId }" />
            <KonvaRect
              v-else-if="element.type === 'rect'"
              :element="{ ...element, id: elementId }"
            />
            <KonvaImage
              v-else-if="element.type === 'image'"
              :element="{ ...element, id: elementId }"
            />
            <KonvaButton
              v-else-if="element.type === 'button'"
              :element="{ ...element, id: elementId }"
              @click="handleButtonClick"
            />
          </template>
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'
// import { CanvasInitializer } from '@/services/canvasInitializer'  // TODO: Replace with useLoadStore
import { KonvaText, KonvaRect, KonvaImage } from '@/components/konvaComponents'
import KonvaButton from '@/components/konvaComponents/KonvaButton.vue'
import type { CanvasElement } from '@/stores/canvas'

const canvasStore = useCanvasStore()
const { adUnits } = storeToRefs(canvasStore)
const { switchToFocusMode } = canvasStore

const renderKey = ref(0)

const handleButtonClick = (element: CanvasElement) => {
  console.log('🔘 Button clicked:', element.id)

  if (element.id && element.id.includes('edit-button')) {
    const adUnitId = element.id.replace('-edit-button', '')
    console.log('🔧 Edit button clicked for:', adUnitId)
    switchToFocusMode(adUnitId)
  }
}

onMounted(async () => {
  // TODO: Replace with useLoadStore - temporarily commented out
  if (!canvasStore.isInitialized) {
    console.log('🚀 First load: initialization bypassed - using new useLoadStore system')
    // await CanvasInitializer.initialize()
    // Force re-render after images are loaded
    await nextTick()
    renderKey.value++
    console.log('🔄 Bulk mode canvas rendered without old initializer')
  } else {
    console.log('📋 Canvas already initialized, rendering existing data')
    renderKey.value++
  }
})

console.log('📋 BulkMode Canvas mounted')
</script>

<style scoped>
.bulkmode-canvas {
  border: 2px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background: #b5b5b5;
}
</style>
