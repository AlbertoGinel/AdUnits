import { useCanvasStore } from '@/stores/canvas'
import type { AdUnit, CanvasElement, LayerDefinition } from '@/stores/canvas'

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
        adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
      }
    },
    updateLayer: (layerId: string, updates: Partial<LayerDefinition>) => {
      if (store.layers[layerId]) {
        store.layers[layerId] = { ...store.layers[layerId], ...updates }
      }
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
