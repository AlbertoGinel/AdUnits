<template>
  <aside class="canvas-area">
    <!-- Canvas heading -->
    <div class="canvas-header">
      <h2>Canvas</h2>
    </div>

    <!-- Layers Panel -->
    <LayersPanel />
  </aside>
</template>

<script setup lang="ts">
import LayersPanel from './LayersPanel.vue'
</script>

<style scoped>
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  border-left: 1px solid #e0e0e0;
}

.canvas-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.canvas-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>
