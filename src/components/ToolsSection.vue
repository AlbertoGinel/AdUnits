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
import ToolsBar from './ToolsBar.vue'
import ToolsArea from './ToolsArea.vue'
import { useTools } from '@/composables/Tools/useTools'

const { selectedTool, activeSubView, handleToolSelected, handleNavigate } = useTools()
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
