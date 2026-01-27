import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/data/stores/useAppStore'
import { useLayerStore } from '@/data/stores/useLayerStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useKonvaStage } from '@/features/stage/composables/useKonvaStage'
import { useElementHighlight } from '@/features/stage/composables/useElementHighlight'
import type { IconName } from '@/features/utils/useIcons'
import type { EditableElementType } from '@/types/mainTypes'

export interface LayerItem {
  id: string
  name: string
  iconName: IconName
}

export function useCanvasTool() {
  const appStore = useAppStore()
  const layerStore = useLayerStore()
  const adUnitStore = useAdUnitStore()
  const { zoomToFit, setZoom, getBackgroundColor, setBackgroundColor } = useKonvaStage()
  const highlight = useElementHighlight()

  // ===== ZOOM CONTROL LOGIC =====

  // Reactive zoom selection
  const selectedZoom = ref('fit')

  // ===== BACKGROUND COLOR CONTROL =====

  // Background color v-model variable - initialized from stage
  const backgroundColorInput = ref(getBackgroundColor().replace('#', ''))

  // Watch for changes and update stage
  watch(backgroundColorInput, (newValue) => {
    if (newValue && newValue.length === 6) {
      setBackgroundColor(newValue)
    }
  })

  // Handle zoom dropdown changes
  const handleZoomChange = () => {
    if (selectedZoom.value === 'fit') {
      zoomToFit()
    } else {
      // Convert percentage string to decimal (e.g., "100" -> 1.0)
      const zoomLevel = parseInt(selectedZoom.value) / 100
      setZoom(zoomLevel)
    }
  }

  // ===== LAYERS LOGIC =====

  // Mapping for layer IDs to display names and icons
  const layerMapping: Record<string, { name: string; iconName: IconName }> = {
    headline: { name: 'Headline', iconName: 'textTool' },
    logo: { name: 'Logo', iconName: 'logoTool' },
    subhead: { name: 'Subheadline', iconName: 'textTool' },
    cta: { name: 'CTA', iconName: 'textTool' },
    image: { name: 'Image', iconName: 'imageTool' },
    disclaimer: { name: 'Disclaimer Text', iconName: 'textTool' },
    disclaimerBG: { name: 'Disclaimer BG', iconName: 'vectorialCursor' },
  }

  // Dynamic layers list based on current view mode
  const layersList = computed<LayerItem[]>(() => {
    const currentView = appStore.getCurrentView()

    if (currentView === 'bulkMode') {
      // Bulk mode: show layers from store
      const layers = layerStore.getLayers()
      return Object.entries(layers)
        .filter(([id]) => layerMapping[id]) // Filter out unmapped layers
        .map(([id]) => {
          const mapping = layerMapping[id]!
          return {
            id,
            name: mapping.name,
            iconName: mapping.iconName,
          }
        })
    } else {
      // Focus mode: show elements from current ad unit
      const currentAdUnitId = appStore.getCurrentAdUnitId()
      if (!currentAdUnitId) return []

      const elements = adUnitStore.getAdUnitElements(currentAdUnitId)
      return elements
        .filter((element) => element.type && layerMapping[element.type]) // Filter out elements without valid types
        .map((element) => {
          const mapping = layerMapping[element.type]!
          return {
            id: element.type,
            name: mapping.name,
            iconName: mapping.iconName,
          }
        })
    }
  })

  // ===== LAYER HIGHLIGHT LOGIC =====

  const handleLayerHover = (layerId: string) => {
    // layerId is the EditableElementType (e.g., 'headline', 'image', etc.)
    highlight.highlightElementsByType(layerId as EditableElementType)
  }

  const handleLayerHoverEnd = () => {
    // ✅ Re-enable clearing highlights when hover ends
    highlight.clearHighlights()
  }

  // ✅ DEBUGGING: Manual highlight control for investigation
  const debugHighlightImage = () => {
    highlight.highlightElementsByType('image')
    console.log('🔍 DEBUG: Permanently highlighting images for zoom/pan investigation')
  }

  const debugClearHighlights = () => {
    highlight.clearHighlights()
    console.log('🔍 DEBUG: Manually cleared highlights')
  }

  return {
    // Zoom controls
    selectedZoom,
    handleZoomChange,

    // Background color
    backgroundColorInput,

    // Layers
    layersList,
    layerMapping,
    handleLayerHover,
    handleLayerHoverEnd,

    // ✅ DEBUGGING: Manual highlight controls
    debugHighlightImage,
    debugClearHighlights,

    // Direct access to stage functions
    zoomToFit,
    setZoom,
  }
}
