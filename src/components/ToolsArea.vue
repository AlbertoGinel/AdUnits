<!-- ToolsArea.vue - Smart Router with Sub-Views -->
<template>
  <div class="tool-area">
    <component
      :is="currentComponent"
      v-if="currentComponent"
      @navigate="$emit('navigate', $event)"
    />
    <EmptyState v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import EditTexts from './toolsMenu/EditTexts.vue'
import EditImages from './toolsMenu/images/EditImages.vue'
import UploadImages from './toolsMenu/images/UploadImages.vue'
import EmptyState from './toolsMenu/EmptyState.vue'

interface Props {
  activeTool?: string
  activeSubView?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSubView: 'default',
})

defineEmits<{
  navigate: [subView: string]
}>()

// Tool registry - map tool + sub-view to component
const toolRegistry: Record<string, Record<string, Component>> = {
  text: {
    default: EditTexts,
  },
  images: {
    default: EditImages,
    edit: EditImages,
    upload: UploadImages,
  },
}

// Get current component to display
const currentComponent = computed(() => {
  if (!props.activeTool) return null

  const tool = toolRegistry[props.activeTool]
  if (!tool) return null

  // Return sub-view component or fallback to default
  return tool[props.activeSubView] || tool.default
})
</script>

<style scoped>
.tool-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px;
}
</style>
