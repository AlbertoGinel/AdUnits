<template>
  <div class="toolbar">
    <button
      v-for="tool in tools"
      :key="tool.id"
      @click="$emit('toolSelected', tool.id)"
      :class="{ active: activeTool === tool.id }"
      class="tool-button"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
      {{ tool.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTool?: string
}

defineProps<Props>()

defineEmits<{
  toolSelected: [toolId: string]
}>()

const tools = [
  { id: 'images', name: 'Images', icon: '🖼️' },
  { id: 'logos', name: 'Logos', icon: '🏢' },
  { id: 'text', name: 'Text', icon: '📝' },
]
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  border-right: 1px solid #dee2e6;
  background: #ffffff;
  min-width: 80px;
  max-width: 100px;
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid #ced4da;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.tool-button:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.tool-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tool-icon {
  font-size: 20px;
}
</style>
