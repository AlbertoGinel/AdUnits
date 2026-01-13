// composables/view/useAdUnitRendering.ts
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useElementRenderer } from './useElementRenderer'
import { useImageManager } from '../../imagesManager/useImageManager'
import type { AdUnitElement } from '@/types/adUnitElementTypes'
// TODO: Implement cropping with new store structure
// import { useCropping } from '@/composables/Tools/useCropping'

export interface ElementRenderData {
  elementId: string
  element: AdUnitElement
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
  const adUnitStore = useAdUnitStore()
  const renderer = useElementRenderer()
  const imageManager = useImageManager()

  // TODO: Implement cropping with new store structure
  const cropping = { isCropping: { value: false } } // Placeholder

  /**
   * Elements to hide during cropping mode
   */
  const HIDE_DURING_CROP = ['logo', 'headline', 'subhead', 'cta', 'disclaimer', 'cta-background']

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
    const elements = adUnitStore.getAdUnitElements(adUnitId)

    const renderData = elements.map((element) => {
      // Use element tag or index as key
      const elementId = element.type
      const config = renderer.getElementConfig(element)

      // Add loaded image to config for image elements (logo, image - NOT background)
      if ((element.type === 'logo' || element.type === 'image') && element.image) {
        const loadedImage = imageManager.getImageOptimized(element.image)
        if (loadedImage) {
          config.image = loadedImage
        }
      }

      // Determine visibility: base visibility AND not hidden during crop
      const baseVisible = renderer.isElementVisible(element)
      const hiddenDuringCrop = cropping.isCropping.value && HIDE_DURING_CROP.includes(elementId)
      const visible = baseVisible && !hiddenDuringCrop

      return {
        elementId,
        element,
        visible,
        isCropping: cropping.isCropping.value,
        config,
        loadedImage:
          (element.type === 'logo' || element.type === 'image') && element.image
            ? imageManager.getImageOptimized(element.image)
            : null,
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
