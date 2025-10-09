<template>
  <div class="tools-area">
    <div class="tools-area-header">
      <h4>{{ currentToolName }}</h4>
    </div>
    <div class="tools-area-content">
      <component :is="currentToolComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useToolsStore } from '@/stores/tools'
import ImagesMenu from './tools/ImagesMenu.vue'
import ShapesMenu from './tools/ShapesMenu.vue'
import TextMenu from './tools/TextMenu.vue'

const toolsStore = useToolsStore()

const toolComponents: Record<string, Component | (() => Promise<Component>)> = {
  images: ImagesMenu,
  shapes: ShapesMenu,
  text: TextMenu,
  elements: () => import('./tools/ElementsMenu.vue'),
  templates: () => import('./tools/TemplatesMenu.vue'),
  background: () => import('./tools/BackgroundMenu.vue'),
}

const toolNames: Record<string, string> = {
  images: 'Images',
  shapes: 'Shapes',
  text: 'Text',
  elements: 'Elements',
  templates: 'Templates',
  background: 'Background',
}

const currentToolComponent = computed(() => {
  return toolComponents[toolsStore.activeTool] || ImagesMenu
})

const currentToolName = computed(() => {
  return toolNames[toolsStore.activeTool] || 'Tools'
})
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

.tools-area-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
