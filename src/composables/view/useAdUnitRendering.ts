// composables/view/useAdUnitRendering.ts
import { useCanvasManager } from './useCanvasManager'
import { useElementRenderer } from './useElementRenderer'
import { useElementLoader } from './useElementLoader'
import type { CanvasElement } from '@/stores/canvas'

export interface ElementRenderData {
  elementId: string
  element: CanvasElement
  visible: boolean
  isCropping: boolean
  config: Record<string, unknown>
  loadedImage: HTMLImageElement | null
}

/**
 * Orchestrates all rendering logic
 * Combines data, transformation, and loading
 */
export function useAdUnitRendering() {
  const manager = useCanvasManager()
  const renderer = useElementRenderer()
  const loader = useElementLoader()

  /**
   * Define rendering order (bottom to top)
   * Elements render in this order - later items appear on top
   */
  const renderOrder = [
    'background', // 0 - Bottom layer
    'image', // 1 - Main image
    'disclaimerBG', // 2 - Gradient overlay for disclaimer
    'disclaimer', // 3 - Disclaimer text (on top of disclaimerBG)
    'cta-background', // 4 - CTA button background
    'cta', // 5 - CTA text (on top of cta-background)
    'logo', // 6 - Logo
    'headline', // 7 - Headline text
    'subhead', // 8 - Subheadline text (top layer)
  ]

  /**
   * Get complete render data for all elements in an ad unit
   * Sorted by predefined render order
   */
  const getAdUnitRenderableElements = (adUnitId: string): ElementRenderData[] => {
    const elements = manager.getAdUnitElements(adUnitId)

    const renderData = Object.entries(elements).map(([elementId, element]) => {
      const config = renderer.getElementConfig(element)

      // Add loaded image to config for image elements
      if (element.type === 'image' && element.image) {
        const loadedImage = loader.getLoadedImage(element.image)
        if (loadedImage) {
          config.image = loadedImage
        }
      }

      return {
        elementId,
        element,
        visible: renderer.isElementVisible(element),
        isCropping: loader.isElementCropping(elementId),
        config,
        loadedImage:
          element.type === 'image' && element.image ? loader.getLoadedImage(element.image) : null,
      }
    })

    // Sort by predefined render order
    return renderData.sort((a, b) => {
      const indexA = renderOrder.indexOf(a.elementId)
      const indexB = renderOrder.indexOf(b.elementId)

      // If element not in order list, put it at the end
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })
  }

  return {
    getAdUnitRenderableElements,
  }
}
