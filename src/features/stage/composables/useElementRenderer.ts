// composables/view/useElementRenderer.ts
import type { AdUnitElement } from '@/types/adUnitElementTypes'
import {
  isTextElement,
  isImageElement,
  isRectElement,
  hasVisibility,
} from '@/types/adUnitElementTypes'
import { useImageManager } from '@/features/imagesManager/useImageManager'

/**
 * Pure element rendering logic
 * NO store imports, NO side effects
 * Just transforms CanvasElement → Konva Config
 */
export function useElementRenderer() {
  /**
   * Check if element should be visible
   * Pure function
   */
  const isElementVisible = (element: AdUnitElement): boolean => {
    return hasVisibility(element) ? element.visibility !== false : true
  }

  /**
   * Transform AdUnitElement to Konva configuration
   * Pure function: same input always gives same output
   */
  const getElementConfig = (element: AdUnitElement): Record<string, unknown> => {
    const baseConfig = {
      x: element.x,
      y: element.y,
      name: element.type, // Use element type instead of tag
    }

    // Handle text elements (headline, subhead, cta, disclaimer)
    if (isTextElement(element)) {
      return {
        ...baseConfig,
        text: element.text || '',
        fontSize: element.fontSize || 14,
        fontFamily: element.fontFamily || 'Arial',
        fontStyle: element.fontStyle || 'normal',
        fill: element.fill || '#000000',
        align: element.align || 'left',
        verticalAlign: element.verticalAlign || 'top',
        wrap: element.wrap || 'word',
        width: element.width,
        height: element.height,
      }
    }

    // Handle rectangle elements (background, cta-background, disclaimerBG)
    if (isRectElement(element)) {
      return {
        ...baseConfig,
        width: element.width || 100,
        height: element.height || 100,
        opacity: 50,
        ...(element.fillLinearGradientStartPoint ? {} : { fill: element.fill || '#ffffff' }),
        cornerRadius: element.cornerRadius || 0,
        stroke: element.strokeColor || '#000000',
        strokeWidth: element.strokeWidth || 0,
        ...(element.fillLinearGradientStartPoint && {
          fillLinearGradientStartPoint: element.fillLinearGradientStartPoint,
          fillLinearGradientEndPoint: element.fillLinearGradientEndPoint,
          fillLinearGradientColorStops: element.fillLinearGradientColorStops,
        }),
      }
    }

    // Handle image elements (logo, image)
    if (isImageElement(element)) {
      // Logo-specific rendering with aspect ratio calculation
      if (element.type === 'logo') {
        const imageManager = useImageManager()
        const maxWidth = element.width || 100
        const maxHeight = element.height || 100
        const centerX = element.x
        const centerY = element.y

        // Get original logo dimensions
        let actualWidth = maxWidth
        let actualHeight = maxHeight
        let finalX = centerX
        let finalY = centerY

        if (element.image) {
          const dimensions = imageManager.getDimensionsById(element.image)
          if (dimensions) {
            const { naturalWidth, naturalHeight } = dimensions

            // Calculate aspect ratio fit within max bounds
            const aspectRatio = naturalWidth / naturalHeight
            const maxAspectRatio = maxWidth / maxHeight

            if (aspectRatio > maxAspectRatio) {
              // Logo is wider, fit by width
              actualWidth = maxWidth
              actualHeight = maxWidth / aspectRatio
            } else {
              // Logo is taller, fit by height
              actualHeight = maxHeight
              actualWidth = maxHeight * aspectRatio
            }

            // Center the logo within the max bounds
            finalX = centerX - actualWidth / 2
            finalY = centerY - actualHeight / 2
          }
        }

        return {
          x: finalX,
          y: finalY,
          width: actualWidth,
          height: actualHeight,
        }
      } else {
        // Standard image rendering (type: 'image')
        return {
          ...baseConfig,
          width: element.width || 100,
          height: element.height || 100,
          // Crop if present (mainly for images, not logos)
          ...(element.crop && {
            cropX: element.crop.x,
            cropY: element.crop.y,
            cropWidth: element.crop.width,
            cropHeight: element.crop.height,
          }),
        }
      }
    }

    // Fallback for unknown types
    return baseConfig
  }

  return {
    getElementConfig,
    isElementVisible,
  }
}
