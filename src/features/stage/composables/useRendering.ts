import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useImageService } from '@/data/services/useImageService'
import type { AdUnitElement } from '@/types/adUnitElementTypes'
import {
  isTextElement,
  isImageElement,
  isRectElement,
  hasVisibility,
} from '@/types/adUnitElementTypes'

export interface RenderableElement {
  id: string
  element: AdUnitElement
  config: Record<string, unknown>
  visible: boolean
}

/**
 * Unified rendering composable
 * Transforms AdUnit elements → Konva-ready configs
 */
export function useRendering() {
  const adUnitStore = useAdUnitStore()
  const imageService = useImageService()

  const HIDE_DURING_CROP = ['logo', 'headline', 'subhead', 'cta', 'disclaimer', 'cta-background']
  const RENDER_ORDER = [
    'background',
    'image',
    'disclaimerBG',
    'disclaimer',
    'cta-background',
    'cta',
    'logo',
    'headline',
    'subhead',
  ]

  const isCropping = false // TODO: Connect to crop mode state

  // Build Konva config - minimal transformations only
  const buildKonvaConfig = (element: AdUnitElement): Record<string, unknown> => {
    // Base config - all elements have these
    const config: Record<string, unknown> = {
      x: element.x,
      y: element.y,
      name: element.type,
    }

    // Text elements - spread all text properties
    if (isTextElement(element)) {
      return {
        ...config,
        text: element.text,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontStyle: element.fontStyle,
        fill: element.fill,
        align: element.align,
        verticalAlign: element.verticalAlign,
        wrap: element.wrap,
        width: element.width,
        height: element.height,
      }
    }

    // Rect elements - spread rect properties
    if (isRectElement(element)) {
      const rectConfig: Record<string, unknown> = {
        ...config,
        width: element.width,
        height: element.height,
        cornerRadius: element.cornerRadius,
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth,
      }

      // Add gradient OR fill (mutually exclusive - discriminated union)
      if ('fillLinearGradientStartPoint' in element) {
        rectConfig.fillLinearGradientStartPoint = element.fillLinearGradientStartPoint
        rectConfig.fillLinearGradientEndPoint = element.fillLinearGradientEndPoint
        rectConfig.fillLinearGradientColorStops = element.fillLinearGradientColorStops
      } else {
        rectConfig.fill = element.fill
      }

      return rectConfig
    }

    // Image elements - load image + handle special cases
    if (isImageElement(element)) {
      // Load image from manager
      const loadedImage = imageService.getImageElement(element.imageID)

      // Special case: Logo needs centering
      if (element.type === 'logo' && loadedImage) {
        const dimensions = imageService.getNaturalDimensions(element.imageID)

        if (dimensions) {
          const { width: naturalWidth, height: naturalHeight } = dimensions
          const aspectRatio = naturalWidth / naturalHeight
          const maxAspectRatio = element.width / element.height

          const actualWidth =
            aspectRatio > maxAspectRatio ? element.width : element.height * aspectRatio
          const actualHeight =
            aspectRatio > maxAspectRatio ? element.width / aspectRatio : element.height

          return {
            ...config,
            x: element.x - actualWidth / 2,
            y: element.y - actualHeight / 2,
            width: actualWidth,
            height: actualHeight,
            image: loadedImage,
          }
        }
      }

      // Standard image config
      const imageConfig: Record<string, unknown> = {
        ...config,
        width: element.width,
        height: element.height,
        image: loadedImage,
      }

      // Add crop if exists (only for main image)
      if (element.type === 'image' && 'cropData' in element && element.cropData) {
        imageConfig.cropX = element.cropData.x
        imageConfig.cropY = element.cropData.y
        imageConfig.cropWidth = element.cropData.width
        imageConfig.cropHeight = element.cropData.height
      }

      return imageConfig
    }

    return config
  }

  // Check visibility
  const isElementVisible = (element: AdUnitElement): boolean => {
    const baseVisible = hasVisibility(element) ? element.visibility !== false : true
    const hiddenDuringCrop = isCropping && HIDE_DURING_CROP.includes(element.type)
    return baseVisible && !hiddenDuringCrop
  }

  // Get renderable elements for an ad unit
  const getRenderableElements = (adUnitID: string): RenderableElement[] => {
    const elements = adUnitStore.getAdUnitElements(adUnitID)

    return elements
      .map((element) => ({
        id: element.type,
        element,
        config: buildKonvaConfig(element),
        visible: isElementVisible(element),
      }))
      .sort((a, b) => {
        const indexA = RENDER_ORDER.indexOf(a.id)
        const indexB = RENDER_ORDER.indexOf(b.id)
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
  }

  return {
    getRenderableElements,
  }
}
