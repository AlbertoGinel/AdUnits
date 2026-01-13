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
import CanvasScreen from '../stage/componets/CanvasScreen.vue'
</script>

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 350px 1fr 280px; /* Default fixed widths instead of auto */
  gap: 0;
  overflow: hidden;
  background: #f5f5f5;
  height: 100%;

  /* Grid containment - prevent children from affecting layout */
  contain: layout;
  min-width: 0;
  min-height: 0;
}

/* Explicit grid positioning for each child */
.main-container > :nth-child(1) {
  grid-column: 1;
  min-width: 0;
  contain: layout;
}

.main-container > :nth-child(2) {
  grid-column: 2;
  min-width: 0;
  contain: layout;
  overflow: hidden;
}

.main-container > :nth-child(3) {
  grid-column: 3;
  min-width: 0;
  contain: layout;
}

/* Responsive design - Based on 80:240:65 proportion (385px total) */

@media (max-width: 1535px) {
  .main-container {
    grid-template-columns: 317px 1fr 258px;
  }
}

@media (max-width: 1279px) {
  .main-container {
    grid-template-columns: 264px 1fr 215px;
  }
}

@media (max-width: 1023px) {
  .main-container {
    grid-template-columns: 231px 1fr 172px;
  }
}

@media (max-width: 767px) {
  .main-container {
    grid-template-columns: 231px 1fr 129px;
  }
}

@media (max-width: 639px) {
  .main-container {
    grid-template-columns: 231px 1fr 107px;
  }
}
</style>
