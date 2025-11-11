import { useLayers } from '../data/useLayers'
import { useAdUnits } from '../data/useAdUnits'
import type { LayerDefinition, AdUnit } from '@/stores/canvas'

/**
 * Simple store loader - loads initial data when app starts
 */
export function useLoadStore() {
  const { setAllLayers } = useLayers()
  const { setAllAdUnits } = useAdUnits()

  const loadLayers = async () => {
    try {
      // Load the frames.json file using dynamic import
      const framesModule = await import('../setupFrames/frames.json')
      const data = framesModule.default as Record<string, unknown>

      // Extract layers from the JSON
      const layers = data?.layers as Record<string, unknown>

      if (!layers) {
        throw new Error('No layers found in frames.json')
      }

      // Load layers into store via useLayers
      setAllLayers(layers as Record<string, LayerDefinition>)

      console.log('✅ Layers loaded successfully:', Object.keys(layers))
    } catch (error) {
      console.error('❌ Failed to load layers:', error)
      throw error
    }
  }

  const loadAdUnits = async () => {
    try {
      // Load the frames.json file using dynamic import
      const framesModule = await import('../setupFrames/frames.json')
      const data = framesModule.default as Record<string, unknown>

      // Extract adUnits from the JSON
      const adUnits = data?.adUnits as Record<string, AdUnit>

      if (!adUnits) {
        throw new Error('No adUnits found in frames.json')
      }

      // Load adUnits into store via useAdUnits
      setAllAdUnits(adUnits)

      console.log('✅ AdUnits loaded successfully:', Object.keys(adUnits))
    } catch (error) {
      console.error('❌ Failed to load adUnits:', error)
      throw error
    }
  }

  return {
    loadLayers,
    loadAdUnits,
  }
}
