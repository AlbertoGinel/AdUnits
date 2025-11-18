// composables/Tools/useToolNavigation.ts
import { ref, computed } from 'vue'

const activeTool = ref<string | null>(null)
const activeSubTool = ref<string | null>(null)

export function useToolNavigation() {
  const setActiveTool = (toolId: string) => {
    activeTool.value = toolId
    activeSubTool.value = null // Reset sub-tool when changing main tool
  }

  const setActiveSubTool = (subToolId: string) => {
    activeSubTool.value = subToolId
  }

  const getActiveTool = () => activeTool.value
  const getActiveSubTool = () => activeSubTool.value

  const isToolActive = (toolId: string) => activeTool.value === toolId
  const isSubToolActive = (subToolId: string) => activeSubTool.value === subToolId

  return {
    activeTool: computed(() => activeTool.value),
    activeSubTool: computed(() => activeSubTool.value),
    setActiveTool,
    setActiveSubTool,
    getActiveTool,
    getActiveSubTool,
    isToolActive,
    isSubToolActive,
  }
}
