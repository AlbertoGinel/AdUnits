<!-- ToolsArea.vue - Smart Router with Sub-Views -->
<template>
  <div class="tool-area">
    <EditTextsSkeleton v-if="!suspenseManager.bundleReady.value" />

    <template v-else>
      <component
        :is="currentComponent"
        v-if="currentComponent"
        @navigate="$emit('navigate', $event)"
      />
      <EmptyState v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import EditTexts from './toolsMenu/EditTexts.vue'
import EditImages from './toolsMenu/assets/EditAssets.vue'
import UploadImages from './toolsMenu/assets/UploadAsset.vue'
import EmptyState from './toolsMenu/EmptyState.vue'
import EditTextsSkeleton from './toolsMenu/EditTextsSkeleton.vue'

const suspenseManager = useSuspenseManager()

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
  logos: {
    default: EditImages, // Same component as images, but will show logo flavor
    edit: EditImages,
    upload: UploadImages,
  },
}

// Get current component to display
const currentComponent = computed(() => {
  console.log('🎯 ToolsArea - activeTool:', props.activeTool, 'activeSubView:', props.activeSubView)

  if (!props.activeTool) {
    console.log('❌ No activeTool provided')
    return null
  }

  const tool = toolRegistry[props.activeTool]
  if (!tool) {
    console.log(
      '❌ No tool found for:',
      props.activeTool,
      'Available tools:',
      Object.keys(toolRegistry),
    )
    return null
  }

  const component = tool[props.activeSubView] || tool.default
  console.log('✅ Component selected:', component?.name || 'unknown', 'for tool:', props.activeTool)
  return component
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
