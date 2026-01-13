// composables/view/useViewState.ts
import { computed } from 'vue'
import { useAppStore } from '@/data/stores/useAppStore'
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import type { AdUnit } from '@/types/mainTypes'

/**
 * View state management layer (Singleton)
 * Pure state management - no DOM dependencies
 */
export function useViewState() {
  const appStore = useAppStore()
  const adUnitStore = useAdUnitStore()

  /**
   * Current view mode (reactive)
   */
  const viewMode = computed(() => appStore.getCurrentView())

  /**
   * Currently focused ad unit ID (reactive)
   */
  const currentAdUnitId = computed(() => appStore.getCurrentAdUnitId())

  /**
   * Currently focused ad unit (reactive)
   */
  const currentAdUnit = computed((): AdUnit | null => {
    if (!currentAdUnitId.value) return null
    return adUnitStore.getAdUnit(currentAdUnitId.value) || null
  })

  /**
   * Is canvas initialized (reactive)
   */
  const isInitialized = computed(() => {
    return adUnitStore.hasAdUnits()
  })

  /**
   * Get visible ad units based on current view mode
   */
  const visibleAdUnits = computed((): Record<string, AdUnit> => {
    // Focus mode: only show the focused ad unit
    if (viewMode.value === 'focusMode' && currentAdUnitId.value) {
      const focusedUnit = adUnitStore.getAdUnit(currentAdUnitId.value)
      return focusedUnit ? { [focusedUnit.id]: focusedUnit } : {}
    }

    // Bulk mode: show all ad units
    return adUnitStore.getAllAdUnits()
  })

  /**
   * Switch to bulk mode (show all ad units)
   */
  const switchToBulkMode = () => {
    appStore.setCurrentView('bulkMode')
    appStore.setCurrentAdUnitId(null)
  }

  /**
   * Switch to focus mode (show single ad unit)
   */
  const switchToFocusMode = (adUnitId: string) => {
    const adUnit = adUnitStore.getAdUnit(adUnitId)
    if (!adUnit) {
      console.warn(`Cannot focus on non-existent ad unit: ${adUnitId}`)
      return
    }

    appStore.setCurrentView('focusMode')
    appStore.setCurrentAdUnitId(adUnitId)
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
