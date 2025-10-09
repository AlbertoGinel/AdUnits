import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToolType = 'images' | 'shapes' | 'text' | 'elements' | 'templates' | 'background'

export const useToolsStore = defineStore('tools', () => {
  const activeTool = ref<ToolType>('images')

  const setActiveTool = (tool: ToolType) => {
    activeTool.value = tool
  }

  const getActiveTool = () => {
    return activeTool.value
  }

  return {
    activeTool,
    setActiveTool,
    getActiveTool,
  }
})
