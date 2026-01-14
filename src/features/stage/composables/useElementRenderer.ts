// composables/view/useElementRenderer.ts
import type { AdUnitElement } from '@/types/adUnitElementTypes'
import {
  isTextElement,
  isImageElement,
  isRectElement,
  hasVisibility,
} from '@/types/adUnitElementTypes'
import { useImageManager } from '@/features/imagesManager/useImageManager'

// Type-specific config builders
type KonvaConfig = Record<string, unknown>

const baseConfig = (element: AdUnitElement): KonvaConfig => ({
  x: element.x,
  y: element.y,
  name: element.id,
})

const textConfig = (element: Extract<AdUnitElement, { text: string }>): KonvaConfig => ({
  ...baseConfig(element),
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
})

const rectConfig = (element: Extract<AdUnitElement, { cornerRadius: number }>): KonvaConfig => ({
  ...baseConfig(element),
  width: element.width,
  height: element.height,
  ...(element.fillLinearGradientStartPoint
    ? {
        fillLinearGradientStartPoint: element.fillLinearGradientStartPoint,
        fillLinearGradientEndPoint: element.fillLinearGradientEndPoint,
        fillLinearGradientColorStops: element.fillLinearGradientColorStops,
      }
    : { fill: element.fill }),
  cornerRadius: element.cornerRadius,
  stroke: element.strokeColor,
  strokeWidth: element.strokeWidth,
})

const logoConfig = (
  element: Extract<AdUnitElement, { imageID: string }>,
  imageManager: ReturnType<typeof useImageManager>,
): KonvaConfig => {
  const maxWidth = element.width
  const maxHeight = element.height
  const centerX = element.x
  const centerY = element.y

  let actualWidth = maxWidth
  let actualHeight = maxHeight
  let finalX = centerX
  let finalY = centerY

  const dimensions = imageManager.getDimensionsById(element.imageID)
  if (dimensions) {
    const { naturalWidth, naturalHeight } = dimensions
    const aspectRatio = naturalWidth / naturalHeight
    const maxAspectRatio = maxWidth / maxHeight

    if (aspectRatio > maxAspectRatio) {
      actualWidth = maxWidth
      actualHeight = maxWidth / aspectRatio
    } else {
      actualHeight = maxHeight
      actualWidth = maxHeight * aspectRatio
    }

    finalX = centerX - actualWidth / 2
    finalY = centerY - actualHeight / 2
  }

  return {
    x: finalX,
    y: finalY,
    width: actualWidth,
    height: actualHeight,
  }
}

const imageConfig = (
  element: Extract<AdUnitElement, { imageID: string; cropData?: unknown }>,
): KonvaConfig => ({
  ...baseConfig(element),
  width: element.width,
  height: element.height,
  ...(element.cropData && {
    cropX: element.cropData.x,
    cropY: element.cropData.y,
    cropWidth: element.cropData.width,
    cropHeight: element.cropData.height,
  }),
})

/**
 * Pure element rendering logic
 * NO store imports, NO side effects
 * Just transforms AdUnitElement → Konva Config
 */
export function useElementRenderer() {
  const imageManager = useImageManager()

  const isElementVisible = (element: AdUnitElement): boolean => {
    return hasVisibility(element) ? element.visibility !== false : true
  }

  const getElementConfig = (element: AdUnitElement): KonvaConfig => {
    if (isTextElement(element)) return textConfig(element)
    if (isRectElement(element)) return rectConfig(element)
    if (isImageElement(element)) {
      return element.id === 'logo' ? logoConfig(element, imageManager) : imageConfig(element)
    }
    return baseConfig(element)
  }

  return {
    getElementConfig,
    isElementVisible,
  }
}
