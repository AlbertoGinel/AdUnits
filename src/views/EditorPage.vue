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
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
