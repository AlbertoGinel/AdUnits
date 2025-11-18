<!-- ToolsArea.vue - Clean Router -->
<template>
  <div class="tool-area">
    <component :is="currentToolComponent" v-if="currentToolComponent" />
    <EmptyState v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import EditTexts from './toolsMenu/EditTexts.vue'
import EditImages from './toolsMenu/images/EditImages.vue'
//import EditLogos from './tools/EditLogos.vue'
import EmptyState from './toolsMenu/EmptyState.vue'

interface Props {
  activeTool?: string
}

const props = defineProps<Props>()

// Tool registry - maps tool IDs to components
const toolComponents: Record<string, Component> = {
  text: EditTexts,
  images: EditImages,
  //logos: EditLogos,
}

const currentToolComponent = computed(() => {
  return props.activeTool ? toolComponents[props.activeTool] : null
})
</script>

<style scoped>
.tool-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
