<template>
  <section class="central-area">
    <CanvasViewManager />
  </section>
</template>

<script setup lang="ts">
import CanvasViewManager from './CanvasViewManager.vue'
</script>

<style scoped>
.central-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
