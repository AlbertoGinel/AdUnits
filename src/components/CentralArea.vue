<template>
  <section class="central-area">
    <CreativeKonvaCanvas />
  </section>
</template>

<script setup lang="ts">
import CreativeKonvaCanvas from './CreativeKonvaCanvas.vue'
</script>

<style scoped>
.central-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
