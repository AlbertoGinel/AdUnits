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

          // Set visibility to true for disclaimer elements
          if (element.tag === 'disclaimer') {
            processedElement.visibility = true
            processedElement.visibilityLock = false
          }

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

        // Auto-generate disclaimerBG element for image elements with tag="image"
        if (element.type === 'image' && element.tag === 'image') {
          const disclaimerBG = {
            type: 'rect' as const,
            x: element.x || 0,
            y: (element.y || 0) + (element.height || 0) / 2,
            width: element.width || 0,
            height: (element.height || 0) / 2,
            fillLinearGradientStartPoint: {
              x: (element.width || 0) / 2,
              y: 0,
            },
            fillLinearGradientEndPoint: {
              x: (element.width || 0) / 2,
              y: (element.height || 0) / 2,
            },
            fillLinearGradientColorStops: [0, '#ffffff00', 1, '#000000'],
            tag: 'disclaimerBG',
            visibility: true,
            visibilityLock: false,
          }
          processedElements['disclaimerBG'] = disclaimerBG
        }
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
