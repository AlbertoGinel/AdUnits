<template>
  <aside class="tools-section">
    <ToolsBar />
    <ToolsArea />
  </aside>
</template>

<script setup lang="ts">
import ToolsBar from './ToolsBar.vue'
import ToolsArea from './ToolsArea.vue'
</script>

<style scoped>
.tools-section {
  background: white;
  display: flex;
  flex-direction: row;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
}
</style>
