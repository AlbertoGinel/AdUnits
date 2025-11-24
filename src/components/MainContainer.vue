<template>
  <main class="main-container">
    <ToolsSection />
    <CanvasScreen />
    <CanvasArea />
  </main>
</template>

<script setup lang="ts">
import ToolsSection from './ToolsSection.vue'
import CanvasArea from './CanvasArea.vue'
import CanvasScreen from '@/components/konva/CanvasScreen.vue'
</script>

<style scoped>
.main-container {
  flex: 1;
  display: grid;
  grid-template-columns: 20% 70% 10%;
  gap: 0;
  overflow: hidden;
  background: #f5f5f5;
}

/* Responsive design */

@media (max-width: 1700px) {
  .main-container {
    grid-template-columns: 340px 1fr 170px;
  }
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 240px 1fr 120px;
  }
}

@media (max-width: 1000px) {
  .main-container {
    grid-template-columns: 200px 1fr 100px;
  }
}

/* For very small screens, consider stacking */
@media (max-width: 750px) {
  .main-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
}
</style>
