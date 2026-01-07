// composables/view/useViewState.ts
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useCanvasManager } from './useCanvasManager'
import type { AdUnit } from '@/stores/canvas'

/**
 * View state management layer (Singleton)
 * Pure state management - no DOM dependencies
 */
export function useViewState() {
  const canvasStore = useCanvasStore()
  const manager = useCanvasManager()

  /**
   * Current view mode (reactive)
   */
  const viewMode = computed(() => canvasStore.currentView)

  /**
   * Currently focused ad unit ID (reactive)
   */
  const currentAdUnitId = computed(() => canvasStore.currentAdUnitId)

  /**
   * Currently focused ad unit (reactive)
   */
  const currentAdUnit = computed((): AdUnit | null => {
    if (!currentAdUnitId.value) return null
    return manager.getAdUnit(currentAdUnitId.value)
  })

  /**
   * Is canvas initialized (reactive)
   */
  const isInitialized = computed(() => {
    const adUnits = manager.getAllAdUnits()
    return Object.keys(adUnits).length > 0
  })

  /**
   * Get visible ad units based on current view mode
   */
  const visibleAdUnits = computed((): Record<string, AdUnit> => {
    // Focus mode: only show the focused ad unit
    if (viewMode.value === 'focusMode' && currentAdUnitId.value) {
      const focusedUnit = manager.getAdUnit(currentAdUnitId.value)
      return focusedUnit ? { [focusedUnit.id]: focusedUnit } : {}
    }

    // Bulk mode: show all ad units
    return manager.getAllAdUnits()
  })

  /**
   * Switch to bulk mode (show all ad units)
   */
  const switchToBulkMode = () => {
    canvasStore.currentView = 'bulkMode'
    canvasStore.currentAdUnitId = null
  }

  /**
   * Switch to focus mode (show single ad unit)
   */
  const switchToFocusMode = (adUnitId: string) => {
    const adUnit = manager.getAdUnit(adUnitId)
    if (!adUnit) {
      console.warn(`Cannot focus on non-existent ad unit: ${adUnitId}`)
      return
    }

    canvasStore.currentView = 'focusMode'
    canvasStore.currentAdUnitId = adUnitId
  }

  /**
   * Check if we're in focus mode
   */
  const isFocusMode = computed(() => viewMode.value === 'focusMode')

  /**
   * Check if we're in bulk mode
   */
  const isBulkMode = computed(() => viewMode.value === 'bulkMode')

  return {
    // State (reactive)
    viewMode,
    currentAdUnitId,
    currentAdUnit,
    isInitialized,
    visibleAdUnits,
    isFocusMode,
    isBulkMode,

    // Actions
    switchToBulkMode,
    switchToFocusMode,
  }
}
