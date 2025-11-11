import type { CanvasElement } from '@/stores/canvas'
import { useCanvasData } from './useCanvasData'

/**
 * Simple element CRUD operations
 */
export function useElements() {
  const canvasData = useCanvasData()

  return {
    // Basic element operations
    getElement: (adUnitId: string, elementId: string) => canvasData.getElement(adUnitId, elementId),
    getAllElements: (adUnitId: string) => canvasData.getAdUnitElements(adUnitId),
    updateElement: (adUnitId: string, elementId: string, updates: Partial<CanvasElement>) =>
      canvasData.updateElement(adUnitId, elementId, updates),
    deleteElement: (adUnitId: string, elementId: string) =>
      canvasData.deleteElement(adUnitId, elementId),
  }
}
