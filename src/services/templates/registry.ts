import type { CanvasElement } from '@/stores/canvas'

export interface AdUnitDefinition {
  id: string
  name: string
  dimensions: { width: number; height: number }
  position: { x: number; y: number }
  contentOffset: { x: number; y: number }
  loader: () => Promise<CanvasElement[]>
}

// ✅ Registry of all available ad units
export const AD_UNIT_REGISTRY: AdUnitDefinition[] = [
  {
    id: 'marquee-app',
    name: 'Marquee App',
    dimensions: { width: 450, height: 95 },
    position: { x: 0, y: 0 },
    contentOffset: { x: 0, y: 16 },
    loader: async () => {
      const { getMarqueeAdUnit } = await import('./marqueeTemplate')
      return getMarqueeAdUnit()
    },
  },
  {
    id: 'brandbox-desktop',
    name: 'Brandbox Desktop',
    dimensions: { width: 245, height: 118 },
    position: { x: 0, y: 117 },
    contentOffset: { x: 0, y: 15 },
    loader: async () => {
      const { getBrandboxAdUnit } = await import('./brandboxTemplate')
      return getBrandboxAdUnit()
    },
  },
  {
    id: 'longmarquee',
    name: 'Long Marquee',
    dimensions: { width: 860, height: 95 },
    position: { x: 0, y: 250 },
    contentOffset: { x: 0, y: 16 },
    loader: async () => {
      const { getLongmarqueeAdUnit } = await import('./longmarqueeTemplate')
      return getLongmarqueeAdUnit()
    },
  },
]

// ✅ Get all registered ad unit definitions
export const getAllAdUnitDefinitions = (): AdUnitDefinition[] => {
  return [...AD_UNIT_REGISTRY]
}
