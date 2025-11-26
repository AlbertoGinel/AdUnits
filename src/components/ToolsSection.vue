<template>
  <div class="tools-section">
    <ToolsBar @tool-selected="handleToolSelected" :active-tool="selectedTool" />
    <ToolsArea
      :active-tool="selectedTool"
      :active-sub-view="activeSubView"
      @navigate="handleNavigate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolsBar from './ToolsBar.vue'
import ToolsArea from './ToolsArea.vue'

const selectedTool = ref<string>('text')
const activeSubView = ref<string>('default')

const handleToolSelected = (tool: string) => {
  selectedTool.value = tool
  activeSubView.value = 'default' // Reset to default view when switching tools
}

const handleNavigate = (subView: string) => {
  activeSubView.value = subView
}
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
