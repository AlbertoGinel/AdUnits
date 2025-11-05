<template>
  <div class="tools-section">
    <SimpleToolBar @tool-selected="selectedTool = $event" :active-tool="selectedTool" />
    <SimpleToolArea :active-tool="selectedTool" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SimpleToolBar from './SimpleToolBar.vue'
import SimpleToolArea from './SimpleToolArea.vue'

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
