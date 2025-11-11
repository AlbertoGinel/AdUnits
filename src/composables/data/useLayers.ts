import type { LayerDefinition } from '@/stores/canvas'
import { useCanvasData } from './useCanvasData'

/**
 * Simple layer CRUD operations
 */
export function useLayers() {
  const canvasData = useCanvasData()

  return {
    // Basic layer operations
    getAllLayers: () => canvasData.getLayers(),
    getLayer: (layerName: string) => canvasData.getLayer(layerName),
    updateLayer: (layerName: string, updates: Partial<LayerDefinition>) =>
      canvasData.updateLayer(layerName, updates),
    deleteLayer: (layerName: string) => canvasData.deleteLayer(layerName),

    //useLoadStore,
    setAllLayers: (layers: Record<string, LayerDefinition>) => {
      canvasData.setLayers(layers)
    },
  }
}
