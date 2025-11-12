// composables/useCanvasManager.ts
import { useCanvasStore } from '@/stores/canvas'
import { useCanvasData } from '@/composables/data/useCanvasData'

import { computed } from 'vue'

export function useCanvasManager() {
  const store = useCanvasStore()
  const canvasData = useCanvasData()

  const viewMode = computed(() => store.currentView)
  const currentAdUnitId = computed(() => store.currentAdUnitId)
  const isInitialized = computed(() => store.isInitialized)

  const visibleAdUnits = computed(() => {
    if (store.currentView === 'focusMode' && store.currentAdUnitId) {
      const focusedUnit = store.adUnits[store.currentAdUnitId]
      return focusedUnit ? { [focusedUnit.id]: focusedUnit } : {}
    }
    return store.adUnits
  })

  const switchToBulkMode = () => {
    store.currentView = 'bulkMode'
    store.currentAdUnitId = null
  }

  const switchToFocusMode = (adUnitId: string) => {
    store.currentView = 'focusMode'
    store.currentAdUnitId = adUnitId
  }

  const getCurrentAdUnit = () => {
    if (!currentAdUnitId.value) return null
    return canvasData.getAdUnit(currentAdUnitId.value)
  }

  return {
    getCurrentAdUnit,
    viewMode,
    currentAdUnitId,
    visibleAdUnits,
    isInitialized,
    switchToBulkMode,
    switchToFocusMode,
  }
}
