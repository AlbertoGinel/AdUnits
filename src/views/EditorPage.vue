<template>
  <div class="editor-page">
    <TopNavbar />
    <MainContainer />
  </div>
</template>

<script setup lang="ts">
import TopNavbar from '@/components/TopNavbar.vue'
import MainContainer from '@/components/MainContainer.vue'
</script>

<style scoped>
.editor-page {
  display: grid;
  grid-template-rows: auto 1fr; /* navbar auto, content fills remaining */
  height: 100vh;
  overflow: hidden;
}
</style>
