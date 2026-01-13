<template>
  <div class="tools-section">
    <ToolsBar />
    <ToolsArea />
  </div>
</template>

<script setup lang="ts">
import ToolsBar from './ToolsBar.vue'
import ToolsArea from './ToolsArea.vue'
</script>

<style scoped>
.tools-section {
  display: flex;
  flex-direction: row;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
}
</style>
