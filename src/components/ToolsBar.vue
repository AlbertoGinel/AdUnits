<template>
  <div class="tools-bar">
    <div
      class="tool-icon"
      v-for="tool in tools"
      :key="tool.id"
      :class="{ active: tool.id === activeToolId }"
      @click="selectTool(tool.id)"
      :title="tool.name"
    >
      <span class="icon">{{ tool.icon }}</span>
      <span class="tool-name">{{ tool.name }}</span>
    </div>

    <!-- Spacer to push extra button to bottom -->
    <div class="spacer"></div>

    <!-- Extra button at bottom -->
    <div class="extra-button" @click="handleExtraAction" title="Settings">
      <span class="icon">⚙️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToolsStore } from '@/stores/tools'

const toolsStore = useToolsStore()
const activeToolId = ref('images')

const tools = [
  { id: 'images', name: 'Images', icon: '🖼️' },
  { id: 'shapes', name: 'Shapes', icon: '⬜' },
  { id: 'text', name: 'Text', icon: '📝' },
  { id: 'elements', name: 'Elements', icon: '🧩' },
  { id: 'templates', name: 'Templates', icon: '📄' },
  { id: 'background', name: 'Background', icon: '🎨' },
]

const selectTool = (toolId: string) => {
  activeToolId.value = toolId
  toolsStore.setActiveTool(toolId)
}

const handleExtraAction = () => {
  console.log('Extra button clicked!')
  // Add your custom logic here
}

// Set initial active tool
toolsStore.setActiveTool(activeToolId.value)
</script>

<style scoped>
.tools-bar {
  background: #f8f9fa;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #e0e0e0;
  width: 80px;
  min-height: 100vh;
}

.tool-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid transparent;
}

.tool-icon:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.tool-icon.active {
  background: #1976d2;
  color: white;
}

.tool-icon.active .tool-name {
  color: white;
}

.icon {
  font-size: 1.2rem;
  margin-bottom: 2px;
  display: block;
}

.tool-name {
  font-size: 0.6rem;
  font-weight: 500;
  text-align: center;
  color: #666;
  line-height: 1.1;
}

.spacer {
  flex: 1;
}

.extra-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid transparent;
  margin-top: 8px;
}

.extra-button:hover {
  background: #e8f5e8;
  border-color: #4caf50;
}

.extra-button .icon {
  font-size: 1.1rem;
}
</style>
