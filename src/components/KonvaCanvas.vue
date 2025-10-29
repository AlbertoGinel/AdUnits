<template>
  <div ref="containerRef" class="canvas-container">
    <!-- Stage renders here -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCanvasStore } from '@/stores/konva'

const containerRef = ref<HTMLDivElement>()
const store = useCanvasStore()

onMounted(() => {
  if (containerRef.value) {
    // Initialize stage with container
    store.initializeWithContainer(containerRef.value)

    // ✅ Watch stage - when it changes, redraw
    watch(
      () => store.stage,
      () => {
        console.log('🎯 Stage changed, redrawing')
        store.stage?.draw()
      },
      { deep: true },
    )
  }
})
</script>
<style scoped>
.canvas-container {
  border: 1px solid #ccc;
}
</style>
