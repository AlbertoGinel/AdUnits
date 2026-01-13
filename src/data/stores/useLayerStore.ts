import { defineStore } from 'pinia'
import type { LayerRecord, Layer } from '../../types/mainTypes'

export const useLayerStore = defineStore('layers', {
  // State
  state: (): { layers: LayerRecord } => ({
    layers: {},
  }),

  // Getters
  getters: {
    getLayer: (state) => {
      return (id: string): Layer | undefined => {
        return state.layers[id]
      }
    },

    getAllLayers: (state) => (): LayerRecord => {
      return { ...state.layers }
    },

    getLayers: (state) => (): LayerRecord => {
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

    getVisibleLayers: (state) => (): LayerRecord => {
      const visibleLayers: LayerRecord = {}
      Object.entries(state.layers).forEach(([id, layer]) => {
        if (layer.visibility !== false) {
          visibleLayers[id] = layer
        }
      })
      return visibleLayers
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setLayers(newLayers: LayerRecord) {
      this.layers = { ...newLayers }
    },

    setLayer(id: string, layer: Layer) {
      this.layers[id] = layer
    },

    // CRUD operations
    addLayer(id: string, layer: Layer) {
      this.layers[id] = layer
    },

    updateLayer(id: string, updates: Partial<Layer>) {
      const existing = this.layers[id]
      if (existing) {
        this.layers[id] = { ...existing, ...updates }
      }
    },

    removeLayer(id: string) {
      delete this.layers[id]
    },

    clearLayers() {
      this.layers = {}
    },

    toggleLayerVisibility(id: string) {
      const layer = this.layers[id]
      if (layer) {
        this.layers[id] = {
          ...layer,
          visibility: layer.visibility === false ? true : false,
        }
      }
    },
  },
})
