import type { AdUnit, CanvasElement } from '@/stores/canvas'
import { useCanvasData } from './useCanvasData'
import { useLayers } from './useLayers'

export function useAdUnits() {
  const canvasData = useCanvasData()
  const layers = useLayers()

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
   * Automatically sets locked: false for text and image elements
   * Sets default values from layers based on element tag
   */
  const setAllAdUnits = (adUnits: Record<string, AdUnit>) => {
    // Get all layers to access default values
    const allLayers = layers.getAllLayers()

    // Process each ad unit to ensure text and image elements are unlocked and have default values
    const processedAdUnits: Record<string, AdUnit> = {}

    Object.entries(adUnits).forEach(([adUnitId, adUnit]) => {
      const processedElements: Record<string, CanvasElement> = {}

      // Process each element in the ad unit
      Object.entries(adUnit.elements).forEach(([elementId, element]) => {
        const processedElement = { ...element }

        // Set locked to false for text and image elements
        if (element.type === 'text' || element.type === 'image') {
          processedElement.locked = false

          // Apply default values from layers if element has a tag
          if (element.tag && allLayers[element.tag]) {
            const layerDef = allLayers[element.tag]

            if (layerDef && element.type === 'text' && layerDef.type === 'text') {
              // Set default text value if current text is empty
              processedElement.text = element.text || layerDef.defaultValue
            } else if (layerDef && element.type === 'image' && layerDef.type === 'image') {
              // Set default image value if current image is empty
              processedElement.image = element.image || layerDef.defaultValue
            }
          }
        }

        processedElements[elementId] = processedElement
      })

      processedAdUnits[adUnitId] = {
        ...adUnit,
        elements: processedElements,
      }
    })

    canvasData.setAdUnits(processedAdUnits)
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
