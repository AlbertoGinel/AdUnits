import { defineStore } from 'pinia'
import type { LayersRecord } from '../../types/LayerTypes'
import type { EditableElementType } from '../../types/mainTypes'

//type Layer = LayersRecord[EditableElementType]

export const useLayerStore = defineStore('layers', {
  // State
  state: (): { layers: LayersRecord } => ({
    layers: {} as LayersRecord,
  }),

  // Getters
  getters: {
    getLayer: (state) => {
      return <T extends EditableElementType>(id: T): LayersRecord[T] | undefined => {
        return state.layers[id]
      }
    },

    getAllLayers: (state) => (): LayersRecord => {
      return { ...state.layers }
    },

    getLayers: (state) => (): LayersRecord => {
      return { ...state.layers }
    },

    getLayerIds: (state) => (): string[] => {
      return Object.keys(state.layers)
    },

    getLayersCount: (state) => (): number => {
      return Object.keys(state.layers).length
    },

    hasLayers: (state) => (): boolean => {
      return Object.keys(state.layers).length > 0
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setLayers(newLayers: LayersRecord) {
      this.layers = { ...newLayers }
    },

    setLayer<T extends EditableElementType>(id: T, layer: LayersRecord[T]) {
      this.layers[id] = layer
    },

    // CRUD operations
    addLayer<T extends EditableElementType>(id: T, layer: LayersRecord[T]) {
      this.layers[id] = layer
    },

    updateLayer<T extends EditableElementType>(id: T, updates: Partial<LayersRecord[T]>) {
      const existing = this.layers[id]
      if (existing) {
        this.layers[id] = { ...existing, ...updates } as LayersRecord[T]
      }
    },

    removeLayer(id: EditableElementType) {
      delete this.layers[id]
    },

    clearLayers() {
      this.layers = {} as LayersRecord
    },
  },
})
