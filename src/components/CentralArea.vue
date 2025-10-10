<template>
  <section class="central-area">
    <BannerKCanvas />
  </section>
</template>

<script setup lang="ts">
import BannerKCanvas from './BannerKCanvas.vue'
</script>

<style scoped>
.central-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
