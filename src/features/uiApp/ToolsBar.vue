<template>
  <div class="toolbar">
    <div class="upper-tools">
      <button
        v-for="tool in upperTools"
        :key="tool.id"
        @click="handleToolSelected(tool.id)"
        :class="{ active: selectedTool === tool.id }"
        class="tool-button"
      >
        <div class="icon tool-icon" v-html="getIcon(tool.iconName)"></div>
        <span class="tool-label">{{ tool.name }}</span>
      </button>
    </div>

    <div class="lower-tools">
      <button
        v-for="button in lowerTools"
        :key="button.id"
        @click="handleButtonClick(button.id)"
        class="tool-button"
      >
        <div class="icon tool-icon" v-html="getIcon(button.iconName)"></div>
        <span class="tool-label">{{ button.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '@/features/utils/useIcons'
import { useEditTools } from '@/features/editTools/useEditTools'
import type { IconName } from '@/features/utils/useIcons'

const { getIcon } = useIcons()
const { selectedTool, handleToolSelected } = useEditTools()

interface Tool {
  id: 'image' | 'logo' | 'text' | 'extras'
  name: string
  iconName: IconName
}

interface ActionButton {
  id: 'back' | 'help'
  name: string
  iconName: IconName
}

const upperTools: Tool[] = [
  { id: 'image', name: 'Images', iconName: 'imageTool' },
  { id: 'logo', name: 'Logos', iconName: 'logoTool' },
  { id: 'text', name: 'Text', iconName: 'textTool' },
  { id: 'extras', name: 'Extras', iconName: 'extras' },
]

const lowerTools: ActionButton[] = [
  { id: 'back', name: 'Back', iconName: 'back' },
  { id: 'help', name: 'Help', iconName: 'help' },
]

const handleButtonClick = (buttonId: 'back' | 'help') => {
  if (buttonId === 'back') {
    // Handle back action
    console.log('Back button clicked')
  } else if (buttonId === 'help') {
    // Handle help action
    console.log('Help button clicked')
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--color-border-light);
  background: var(--color-bg-primary);
  width: 44px;
  padding: var(--spacing-xs);
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.upper-tools {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.lower-tools {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--color-text-secondary);

  width: 36px;
  height: 36px;
  padding: 2px;
  box-sizing: border-box;
}

.tool-button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.tool-button.active {
  background: var(--color-primary-blue);
  color: var(--color-text-white);
}

.tool-button.active .tool-icon {
  color: white;
}

.tool-icon {
  color: var(--color-primary-blue-dark);
  transition: var(--transition-fast);
}

.tool-button:hover .tool-icon {
  color: var(--color-primary-blue-light);
}

.tool-label {
  font-size: 8px;
  font-weight: var(--font-weight-regular);
  text-align: center;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 32px;
}
</style>
