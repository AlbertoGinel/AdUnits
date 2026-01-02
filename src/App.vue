<script setup lang="ts">
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <div id="app">
    <RouterView />

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
