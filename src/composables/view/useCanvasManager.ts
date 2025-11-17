// composables/useCanvasManager.ts
import { useCanvasData } from '@/composables/data/useCanvasData'
import { computed } from 'vue'

export function useCanvasManager() {
  const canvasData = useCanvasData()

  const viewMode = computed(() => canvasData.getCurrentView())
  const currentAdUnitId = computed(() => canvasData.getCurrentAdUnitId())
  const isInitialized = computed(() => canvasData.getIsInitialized())

  const visibleAdUnits = computed(() => {
    const currentView = canvasData.getCurrentView()
    const currentId = canvasData.getCurrentAdUnitId()

    if (currentView === 'focusMode' && currentId) {
      const focusedUnit = canvasData.getAdUnit(currentId)
      return focusedUnit ? { [focusedUnit.id]: focusedUnit } : {}
    }
    return canvasData.getAdUnits()
  })

  const switchToBulkMode = () => {
    canvasData.setCurrentView('bulkMode')
    canvasData.setCurrentAdUnitId(null)
  }

  const switchToFocusMode = (adUnitId: string) => {
    canvasData.setCurrentView('focusMode')
    canvasData.setCurrentAdUnitId(adUnitId)
  }

  const getCurrentAdUnit = () => {
    const currentId = canvasData.getCurrentAdUnitId()
    if (!currentId) return null
    return canvasData.getAdUnit(currentId)
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
