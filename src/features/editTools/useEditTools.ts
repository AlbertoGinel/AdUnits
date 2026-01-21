import { ref, computed } from 'vue'
//import { useCropping } from '@/composables/Tools/useCropping'
import { useAppStore } from '@/data/stores/useAppStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useLayerStore } from '@/data/stores/useLayerStore'
import type { ElementType } from '@/types/mainTypes'

// Define the possible tool types
type ToolType = 'image' | 'logo' | 'text' | 'extras'

// Tool selection state (singleton)
const selectedTool = ref<ToolType>('text')
const activeSubView = ref<string>('default') //every Tool will have its options

export function useEditTools() {
  //const { cancelCrop } = useCropping()
  const appStore = useAppStore()
  const adUnitStore = useAdUnitStore()
  const layerStore = useLayerStore()

  // Computed list of available element types/layers based on current view, in order to build the menu
  const availableItems = computed((): ElementType[] | string[] => {
    const currentView = appStore.getCurrentView()

    if (currentView === 'focusMode') {
      // Focus mode: get element types from current ad unit elements
      const currentAdUnitId = appStore.getCurrentAdUnitId()
      if (!currentAdUnitId) return []

      const elements = adUnitStore.getAdUnitElements(currentAdUnitId)
      const elementTypes = [...new Set(elements.map((el) => el.type))]
      return elementTypes
    } else {
      // Bulk mode: get layer keys
      const layers = layerStore.getLayers()
      return Object.keys(layers)
    }
  })

  // Tool selection handlers
  const handleToolSelected = (tool: ToolType) => {
    //cancelCrop()
    selectedTool.value = tool
    activeSubView.value = 'default'
  }

  const handleNavigate = (subView: string) => {
    activeSubView.value = subView
  }

  return {
    selectedTool,
    activeSubView,
    handleToolSelected,
    handleNavigate,
    getCurrentView: appStore.getCurrentView,
    getCurrentAdUnitId: appStore.getCurrentAdUnitId,
    availableItems,
  }
}
