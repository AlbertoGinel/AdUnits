// composables/useElementRenderer.ts
import { type CanvasElement } from '@/stores/canvas'

export function useElementRenderer() {
  //Purpose: Transforms your raw CanvasElement data into Konva-specific configuration
  const getElementConfig = (element: CanvasElement) => {
    const baseConfig = {
      x: element.x,
      y: element.y,
      ...(element.tag && { name: element.tag }),
    }

    switch (element.type) {
      case 'text':
        return {
          ...baseConfig,
          type: 'text',
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
          type: 'rect',
          width: element.width || 100,
          height: element.height || 100,
          fill: element.fill || '#ffffff',
          cornerRadius: element.cornerRadius || 0,
          stroke: element.strokeColor || '#000000',
          strokeWidth: element.strokeWidth || 1,
        }

      case 'image':
        return {
          ...baseConfig,
          type: 'image',
          width: element.width || 100,
          height: element.height || 100,
          ...(element.image && { image: element.image }),
          ...(element.crop && {
            cropX: element.crop.x,
            cropY: element.crop.y,
            cropWidth: element.crop.width,
            cropHeight: element.crop.height,
          }),
        }

      case 'button':
        return {
          ...baseConfig,
          type: 'button',
          width: element.width || 80,
          height: element.height || 30,
          fill: element.fill || '#007bff',
          cornerRadius: element.cornerRadius || 4,
          stroke: element.strokeColor || '#0056b3',
          strokeWidth: element.strokeWidth || 1,
        }

      default:
        return baseConfig
    }
  }

  const renderElement = (element: CanvasElement, elementId: string) => {
    const config = getElementConfig(element)

    return {
      key: elementId,
      config,
    }
  }

  return {
    renderElement,
  }
}
