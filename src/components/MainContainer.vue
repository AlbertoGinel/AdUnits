<template>
  <main class="main-container">
    <ToolsSection />
    <CentralArea />
    <CanvasArea />
  </main>
</template>

<script setup lang="ts">
import ToolsSection from './ToolsSection.vue'
import CanvasArea from './CanvasArea.vue'
import CentralArea from './CentralArea.vue'
</script>

<style scoped>
.main-container {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr 300px;
  gap: 0;
  overflow: hidden;
  background: #f5f5f5;
}

/* Responsive design */
@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 250px 1fr 280px;
  }
}

@media (max-width: 992px) {
  .main-container {
    grid-template-columns: 220px 1fr 250px;
  }
}
</style>
