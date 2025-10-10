<template>
  <div class="tools-bar">
    <!-- Render each tool's button (component-based or config-based) -->
    <template v-for="tool in availableTools" :key="tool.id">
      <!-- Component-based button (new way) -->
      <component
        v-if="tool.getButtonComponent"
        :is="tool.getButtonComponent()"
        :tool-id="tool.id"
        :is-active="activeToolId === tool.id"
        @click="selectTool"
      />

      <!-- Config-based button (legacy support) -->
      <ToolsBarButton
        v-else-if="tool.getButtonConfig"
        :config="tool.getButtonConfig()"
        :is-active="tool.id === activeToolId"
        @click="selectTool"
      />
    </template>

    <!-- Spacer to push extra button to bottom -->
    <div class="spacer"></div>

    <!-- Settings button at bottom -->
    <div class="extra-button" @click="handleExtraAction" title="Settings">
      <span class="icon">⚙️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolsBarButton from './ToolsBarButton.vue'
import { toolRegistry } from '@/services/toolRegistry'

// Get all registered tools
const availableTools = computed(() => toolRegistry.getAllTools())

// Get active tool ID
const activeToolId = computed(() => toolRegistry.getActiveToolId())

const selectTool = async (toolId: string) => {
  console.log('🎯 Tool selected:', toolId)
  await toolRegistry.setActiveTool(toolId)
}

const handleExtraAction = () => {
  console.log('Extra button clicked!')
  // Add your custom logic here
}
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
