<template>
  <div class="toolbar">
    <div class="upper-tools">
      <button
        v-for="tool in upperTools"
        :key="tool.id"
        @click="$emit('toolSelected', tool.id)"
        :class="{ active: activeTool === tool.id }"
        class="tool-button"
      >
        <div class="icon tool-icon" v-html="getIcon(tool.iconName)"></div>
        <span class="tool-label">{{ tool.name }}</span>
      </button>
    </div>

    <div class="lower-tools">
      <button
        v-for="tool in lowerTools"
        :key="tool.id"
        @click="$emit('toolSelected', tool.id)"
        :class="{ active: activeTool === tool.id }"
        class="tool-button"
      >
        <div class="icon tool-icon" v-html="getIcon(tool.iconName)"></div>
        <span class="tool-label">{{ tool.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/utils/useIcons'
import type { IconName } from '@/composables/utils/useIcons'

const { getIcon } = useIcons()

interface Props {
  activeTool?: string
}

defineProps<Props>()

defineEmits<{
  toolSelected: [toolId: string]
}>()

interface Tool {
  id: string
  name: string
  iconName: IconName
}

const upperTools: Tool[] = [
  { id: 'images', name: 'Images', iconName: 'imageTool' },
  { id: 'logos', name: 'Logos', iconName: 'logoTool' },
  { id: 'text', name: 'Text', iconName: 'textTool' },
  { id: 'extras', name: 'Extras', iconName: 'extras' },
]

const lowerTools: Tool[] = [
  { id: 'back', name: 'Back', iconName: 'back' },
  { id: 'help', name: 'Help', iconName: 'help' },
]
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
