<template>
  <section class="central-area">
    <KonvaCanvas />
  </section>
</template>

<script setup lang="ts">
import KonvaCanvas from './KonvaCanvas.vue'
</script>

<style scoped>
.central-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
