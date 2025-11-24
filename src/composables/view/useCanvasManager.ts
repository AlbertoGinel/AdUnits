// composables/view/useCanvasManager.ts
import { useCanvasData } from '@/composables/data/useCanvasData'
import type { CanvasElement, AdUnit } from '@/stores/canvas'

/**
 * Pure data access layer
 * NO view logic, NO computed refs
 * Just CRUD operations on canvas data
 */
export function useCanvasManager() {
  const canvasData = useCanvasData()

  return {
    // Read operations
    getAllAdUnits: (): Record<string, AdUnit> => canvasData.getAdUnits(),
    getAdUnit: (adUnitId: string): AdUnit | null => canvasData.getAdUnit(adUnitId),
    getStage: () => canvasData.getStage(),
    getAdUnitElements: (adUnitId: string): Record<string, CanvasElement> => {
      const adUnit = canvasData.getAdUnit(adUnitId)
      return adUnit?.elements || {}
    },
    getElement: (adUnitId: string, elementId: string): CanvasElement | null => {
      return canvasData.getElement(adUnitId, elementId)
    },
    isInitialized: (): boolean => canvasData.getIsInitialized(),
  }
}
