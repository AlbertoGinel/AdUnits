<template>
  <div class="tools-area">
    <!-- Show active tool menu -->
    <template v-if="activeTool">
      <!-- Component-based menu (new way) -->
      <component
        v-if="activeTool.getMenuComponent"
        :key="`${activeTool.id}-${menuKey}`"
        :is="activeTool.getMenuComponent()"
        :tool-id="activeTool.id"
        @action="handleToolAction"
        @state-change="handleToolStateChange"
      />

      <!-- Config-based menu (legacy support) -->
      <ToolMenu
        v-else-if="activeTool.getMenuConfig"
        :key="menuKey"
        :config="activeTool.getMenuConfig()"
        :tool-id="activeTool.id"
        @action="handleToolAction"
        @state-change="handleToolStateChange"
      />
    </template>

    <!-- Fallback when no tool is active -->
    <div v-else class="no-tool-selected">
      <div class="empty-state">
        <span class="empty-icon">🛠️</span>
        <h3>No Tool Selected</h3>
        <p>Choose a tool from the sidebar to start editing</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolMenu from './ToolMenu.vue'
import { toolRegistry } from '@/services/toolRegistry'
import type { ToolAction } from '@/types/toolService'

// Get currently active tool
const activeTool = computed(() => {
  const activeToolId = toolRegistry.getActiveToolId()
  return activeToolId ? toolRegistry.getTool(activeToolId) : null
})

// Force reactivity key for menu updates
const menuKey = ref(0)

// Handle tool actions
const handleToolAction = async (action: ToolAction) => {
  const tool = activeTool.value
  if (!tool) return

  console.log('🔧 Tool action:', action.type, 'from tool:', tool.name)

  try {
    const result = await tool.executeAction(action)

    if (!result.success) {
      console.error('Tool action failed:', result.message)
    } else {
      console.log('✅ Tool action completed successfully')

      // Force menu to re-render with updated config
      menuKey.value++
    }
  } catch (error) {
    console.error('Tool action error:', error)
  }
}

// Handle tool state changes
const handleToolStateChange = (sectionId: string, value: unknown) => {
  console.log('📝 Tool state change:', sectionId, '=', value)

  // Optionally update tool state
  if (activeTool.value && activeTool.value.setState) {
    const currentState = activeTool.value.getState?.() || {}
    activeTool.value.setState({
      ...currentState,
      [sectionId]: value,
    })
  }
}
</script>

<style scoped>
.tools-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.tools-area-header {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.tools-area-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.no-tool-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}
</style>
