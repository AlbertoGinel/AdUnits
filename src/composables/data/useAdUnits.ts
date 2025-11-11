import type { CanvasElement } from '@/stores/canvas'
import { useCanvasData } from './useCanvasData'

export function useAdUnits() {
  const canvasData = useCanvasData()

  /**
   * Get all elements from a specific ad unit
   */
  const getAdUnitElements = (adUnitId: string): CanvasElement[] => {
    const adUnit = canvasData.getAdUnit(adUnitId)
    return adUnit ? Object.values(adUnit.elements) : []
  }

  /**
   * Get elements from ad unit filtered by tag
   */
  const getAdUnitElementsByTag = (adUnitId: string, tag: string) => {
    const elements = getAdUnitElements(adUnitId)
    return elements.filter((element) => element.tag === tag)
  }

  /**
   * Update ad unit configuration (title, frameConfig, etc.)
   */
  const updateAdUnitConfig = (adUnitId: string, updates: object) => {
    canvasData.updateAdUnit(adUnitId, updates)
  }

  /**
   * Delete ad unit and all its elements
   */
  const deleteAdUnit = (adUnitId: string) => {
    canvasData.deleteAdUnit(adUnitId)
  }

  /**
   * Set all ad units at once (bulk operation for loading)
   */
  const setAllAdUnits = (adUnits: Record<string, unknown>) => {
    canvasData.setAdUnits(adUnits)
  }

  return {
    // Simple CRUD operations
    getAllAdUnits: canvasData.getAdUnits,
    getAdUnit: canvasData.getAdUnit,
    updateAdUnit: canvasData.updateAdUnit,
    deleteAdUnit,
    getAdUnitElements,

    // Query operations
    getAdUnitElementsByTag,

    // Configuration
    updateAdUnitConfig,

    // Bulk operations
    setAllAdUnits,
  }
}
