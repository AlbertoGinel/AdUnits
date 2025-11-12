<template>
  <div class="tools-section">
    <ToolsBar @tool-selected="selectedTool = $event" :active-tool="selectedTool" />
    <ToolsArea :active-tool="selectedTool" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolsBar from './ToolsBar.vue'
import ToolsArea from './ToolsArea.vue'

const selectedTool = ref<string>('text') // Default to text tool
</script>

<style scoped>
.tools-section {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
}
</style>
