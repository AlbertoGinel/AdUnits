// composables/view/useElementRenderer.ts
import type { CanvasElement } from '@/stores/canvas'

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
  const isElementVisible = (element: CanvasElement): boolean => {
    return element.visibility !== false
  }

  /**
   * Transform CanvasElement to Konva configuration
   * Pure function: same input always gives same output
   */
  const getElementConfig = (element: CanvasElement): Record<string, unknown> => {
    const baseConfig = {
      x: element.x,
      y: element.y,
      ...(element.tag && { name: element.tag }),
    }

    switch (element.type) {
      case 'text':
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

      case 'rect':
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

      case 'image':
        return {
          ...baseConfig,
          width: element.width || 100,
          height: element.height || 100,
          // Crop if present
          ...(element.crop && {
            cropX: element.crop.x,
            cropY: element.crop.y,
            cropWidth: element.crop.width,
            cropHeight: element.crop.height,
          }),
        }

      default:
        return baseConfig
    }
  }

  return {
    getElementConfig,
    isElementVisible,
  }
}
