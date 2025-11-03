<template>
  <div class="canvas-container">
    <!-- Vue-Konva Canvas -->
    <v-stage :config="{ width: 600, height: 400 }" :key="renderKey">
      <v-layer>
        <!-- Loop through elements from the store -->
        <template v-for="element in elements" :key="element.id">
          <KonvaText v-if="element.type === 'text'" :element="element" />
          <KonvaRect v-else-if="element.type === 'rect'" :element="element" />
          <KonvaImage v-else-if="element.type === 'image'" :element="element" />
          <KonvaButton v-else-if="element.type === 'button'" :element="element" />
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'
import { onMounted, ref, nextTick } from 'vue'
import { CanvasInitializer } from '@/services/canvasInitializer'
import { KonvaText, KonvaRect, KonvaImage } from '@/components/konvaComponents'
import KonvaButton from './konvaComponents/KonvaButton.vue'

const canvasStore = useCanvasStore()
const { elements } = storeToRefs(canvasStore)

// ✅ Simple reactive key to force re-render
const renderKey = ref(0)

onMounted(async () => {
  await CanvasInitializer.initialize()

  // ✅ Force re-render after images are loaded
  await nextTick()
  renderKey.value++
  console.log('🔄 Triggered canvas re-render after image loading')
})

console.log('🎨 KonvaCanvas mounted with vue-konva')
</script>

<style scoped>
.canvas-container {
  border: 2px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background: #b5b5b5;
}

.controls {
  margin-top: 16px;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background: #0056b3;
}
</style>
