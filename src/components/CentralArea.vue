<template>
  <section class="central-area">
    <BannerKonvaCanvas />
  </section>
</template>

<script setup lang="ts">
import BannerKonvaCanvas from './BannerKonvaCanvas.vue'
</script>

<style scoped>
.central-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
