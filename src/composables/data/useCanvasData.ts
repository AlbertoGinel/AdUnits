import { useCanvasStore } from '@/stores/canvas'
import type { AdUnit, CanvasElement, LayerDefinition } from '@/stores/canvas'

// Re-export types for other composables (maintains clean architecture)
export type { AdUnit, CanvasElement, LayerDefinition }

/**
 * Pure data CRUD operations - Direct interface to canvas store
 * This is the only composable that should directly access the canvas store
 */
export function useCanvasData() {
  const store = useCanvasStore()

  return {
    // ========== GET OPERATIONS ==========
    getAdUnits: () => ({ ...store.adUnits }),
    getAdUnit: (id: string) => (store.adUnits[id] ? { ...store.adUnits[id] } : null),
    getLayers: () => ({ ...store.layers }),
    getLayer: (layerId: string) => (store.layers[layerId] ? { ...store.layers[layerId] } : null),
    getCurrentView: () => store.currentView,
    getCurrentAdUnitId: () => store.currentAdUnitId,
    getIsInitialized: () => store.isInitialized,

    // Element getters, all the elements
    getElement: (adUnitId: string, elementId: string) => {
      const adUnit = store.adUnits[adUnitId]
      return adUnit?.elements[elementId] ? { ...adUnit.elements[elementId] } : null
    },
    getAdUnitElements: (adUnitId: string): CanvasElement[] => {
      const adUnit = store.adUnits[adUnitId]
      return adUnit ? Object.values(adUnit.elements) : []
    },

    // Generic helper functions for business logic
    getElementsByTag: (adUnitId: string, tag: string): CanvasElement[] => {
      const adUnit = store.adUnits[adUnitId]
      if (!adUnit) return []
      return Object.values(adUnit.elements).filter((element) => element.tag === tag)
    },

    // Get all ad unit names that have locked elements with specific tag
    getAdUnitNamesWithLockedTag: (tag: string): string[] => {
      const result: string[] = []
      Object.values(store.adUnits).forEach((adUnit) => {
        const hasLockedElement = Object.values(adUnit.elements).some(
          (element) => element.tag === tag && element.locked,
        )
        if (hasLockedElement) {
          result.push(adUnit.title)
        }
      })
      return result
    },

    // Get all ad unit names that have visibility locked elements with specific tag
    getAdUnitNamesWithVisibilityLockedTag: (tag: string): string[] => {
      const result: string[] = []
      Object.values(store.adUnits).forEach((adUnit) => {
        const hasVisibilityLockedElement = Object.values(adUnit.elements).some(
          (element) => element.tag === tag && element.visibilityLock === true,
        )
        if (hasVisibilityLockedElement) {
          result.push(adUnit.title)
        }
      })
      return result
    },

    // ========== SET OPERATIONS ==========
    setAdUnits: (adUnits: Record<string, AdUnit>) => {
      store.adUnits = adUnits
    },
    setAdUnit: (id: string, adUnit: AdUnit) => {
      store.adUnits[id] = adUnit
    },
    setLayers: (layers: Record<string, LayerDefinition>) => {
      store.layers = layers
    },
    setLayer: (layerId: string, layer: LayerDefinition) => {
      store.layers[layerId] = layer
    },
    setCurrentView: (view: 'bulkMode' | 'focusMode') => {
      store.currentView = view
    },
    setCurrentAdUnitId: (id: string | null) => {
      store.currentAdUnitId = id
    },
    setIsInitialized: (initialized: boolean) => {
      store.isInitialized = initialized
    },

    // ========== UPDATE OPERATIONS ==========
    updateAdUnit: (id: string, updates: Partial<AdUnit>) => {
      if (store.adUnits[id]) {
        store.adUnits[id] = { ...store.adUnits[id], ...updates }
      }
    },
    updateElement: (adUnitId: string, elementId: string, updates: Partial<CanvasElement>) => {
      const adUnit = store.adUnits[adUnitId]
      if (adUnit?.elements[elementId]) {
        const element = adUnit.elements[elementId]

        // ⚠️ ENFORCE: Image changes MUST include crop
        if (updates.image !== undefined && element.type === 'image' && updates.crop === undefined) {
          console.error('❌ Image update rejected: Crop is required when changing image')
          console.trace()
          return
        }

        adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
      }
    },
    updateLayer: (layerId: string, updates: Partial<LayerDefinition>) => {
      if (store.layers[layerId]) {
        store.layers[layerId] = { ...store.layers[layerId], ...updates }

        // Auto-cascade: When layer properties change, update matching elements
        Object.keys(store.adUnits).forEach((adUnitId) => {
          const adUnit = store.adUnits[adUnitId]
          if (adUnit) {
            Object.entries(adUnit.elements).forEach(([elementId, element]) => {
              if (element.tag === layerId) {
                const elementUpdates: Partial<CanvasElement> = {}

                // Text cascade: Update unlocked elements when defaultValue changes
                if (updates.defaultValue !== undefined && !element.locked) {
                  elementUpdates.text = updates.defaultValue
                }

                // Image cascade: Update unlocked image elements when defaultValue changes
                // NOTE: Image updates should include crop via useTools, not here
                // This cascade only updates the image ID for consistency
                if (
                  updates.defaultValue !== undefined &&
                  layerId === 'image' &&
                  element.type === 'image' &&
                  !element.locked
                ) {
                  elementUpdates.image = updates.defaultValue
                  // Crop should be provided by the caller (useTools with auto-crop)
                  // We don't auto-calculate here to keep useCanvasData pure
                }

                // Visibility cascade: Update disclaimer elements when visibility changes
                if (
                  updates.visibility !== undefined &&
                  layerId === 'disclaimer' &&
                  !element.visibilityLock
                ) {
                  elementUpdates.visibility = updates.visibility
                }

                // Visibility cascade: Update disclaimerBG elements when visibility changes
                if (
                  updates.visibility !== undefined &&
                  layerId === 'disclaimerBG' &&
                  !element.visibilityLock
                ) {
                  elementUpdates.visibility = updates.visibility
                }

                // Apply updates if any exist
                if (Object.keys(elementUpdates).length > 0) {
                  adUnit.elements[elementId] = { ...element, ...elementUpdates }
                }
              }
            })
          }
        })
      }
    },

    // Free all elements with matching tag (unlock them)
    freeLayer: (layerId: string) => {
      Object.keys(store.adUnits).forEach((adUnitId) => {
        const adUnit = store.adUnits[adUnitId]
        if (adUnit) {
          Object.entries(adUnit.elements).forEach(([elementId, element]) => {
            // Unlock all elements that match the layer tag
            if (element.tag === layerId && element.locked) {
              adUnit.elements[elementId] = {
                ...element,
                locked: false,
              }
            }
          })
        }
      })
    },

    // ========== DELETE OPERATIONS ==========
    deleteAdUnit: (id: string) => {
      delete store.adUnits[id]
    },
    deleteElement: (adUnitId: string, elementId: string) => {
      const adUnit = store.adUnits[adUnitId]
      if (adUnit) {
        delete adUnit.elements[elementId]
      }
    },
    deleteLayer: (layerId: string) => {
      delete store.layers[layerId]
    },

    // ========== BULK OPERATIONS ==========
    updateMultipleElements: (
      updates: Array<{ adUnitId: string; elementId: string; updates: Partial<CanvasElement> }>,
    ) => {
      updates.forEach(({ adUnitId, elementId, updates }) => {
        const adUnit = store.adUnits[adUnitId]
        if (adUnit?.elements[elementId]) {
          adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
        }
      })
    },

    // ========== RESET OPERATIONS ==========
    resetCanvas: () => {
      store.adUnits = {}
      store.layers = {}
      store.currentView = 'bulkMode'
      store.currentAdUnitId = null
      store.isInitialized = false
    },
  }
}
