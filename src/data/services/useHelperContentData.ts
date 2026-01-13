import { useAdUnitStore } from '../stores/useAdUnitStore'
import { useLayerStore } from '../stores/useLayerStore'
import { useImageStore } from '../stores/useImageStore'
import { useAppStore } from '../stores/useAppStore'
import type {
  CreativeContentData,
  AdUnitElements,
  ImageElement,
  LogoElement,
  TextElement,
  DisclaimerElement,
  LayerData,
  ImageMetadata,
  AdUnitData,
} from '../../types/creativeTypes'
import type { AdUnitElement } from '../../types/adUnitElementTypes'
import type { Layer } from '../../types/mainTypes'

/**
 * Service for transforming between NewData stores and CreativeContentData format
 * Handles export to API format and import from API format
 */
export function useContentTransformer() {
  const adUnitsStore = useAdUnitStore()
  const layerStore = useLayerStore()
  const imageStore = useImageStore()
  const appStore = useAppStore()

  /**
   * Transform AdUnitElement to CreativeContentData element format
   */
  function transformToCreativeElement(
    element: AdUnitElement,
    elementKey: string,
  ): Partial<AdUnitElements[keyof AdUnitElements]> | null {
    const baseData = { locked: element.locked || false }

    switch (elementKey) {
      case 'image':
      case 'background':
        // These are ImageElement types in the new system
        if (!('image' in element)) return null
        return {
          ...baseData,
          image: element.image || '',
          ...(element.crop && { crop: element.crop }),
        } as ImageElement

      case 'logo':
        // Logo is LogoElement type
        if (!('image' in element)) return null
        return {
          ...baseData,
          image: element.image || '',
        } as LogoElement

      case 'headline':
      case 'subhead':
      case 'cta':
        // These are TextElement types
        if (!('text' in element)) return null
        return {
          ...baseData,
          text: element.text || '',
        } as TextElement

      case 'disclaimer':
        // Disclaimer is DisclaimerElement type
        if (!('text' in element)) return null
        const disclaimerData: DisclaimerElement = {
          ...baseData,
          text: element.text || '',
        }
        if ('visibility' in element && element.visibility !== undefined) {
          disclaimerData.visibility = element.visibility
        }
        if ('visibilityLock' in element && element.visibilityLock !== undefined) {
          disclaimerData.visibilityLock = element.visibilityLock
        }
        return disclaimerData

      default:
        return null
    }
  }

  /**
   * Transform Layer to CreativeContentData layer format
   */
  function transformToCreativeLayer(layer: Layer): LayerData {
    const layerData: LayerData = {
      type: layer.type,
      defaultValue: layer.defaultValue,
    }

    if (layer.visibility !== undefined) {
      layerData.visibility = layer.visibility
    }

    return layerData
  }

  /**
   * Transform CreativeContentData elements back to AdUnitElement format
   */
  function transformFromCreativeElements(
    elements: AdUnitElements,
    elementKey: string,
  ): Partial<AdUnitElement> | null {
    switch (elementKey) {
      case 'image':
        if (!elements.image) return null
        return {
          type: 'image',
          image: elements.image.image,
          locked: elements.image.locked,
          ...(elements.image.crop && { crop: elements.image.crop }),
        }

      case 'logo':
        if (!elements.logo) return null
        return {
          type: 'logo',
          image: elements.logo.image,
          locked: elements.logo.locked,
        }

      case 'background':
        if (!elements.background) return null
        return {
          type: 'background',
          image: elements.background.image,
          locked: elements.background.locked,
          ...(elements.background.crop && { crop: elements.background.crop }),
        }

      case 'headline':
        if (!elements.headline) return null
        return {
          type: 'headline',
          text: elements.headline.text,
          locked: elements.headline.locked,
        }

      case 'subhead':
        if (!elements.subhead) return null
        return {
          type: 'subhead',
          text: elements.subhead.text,
          locked: elements.subhead.locked,
        }

      case 'cta':
        if (!elements.cta) return null
        return {
          type: 'cta',
          text: elements.cta.text,
          locked: elements.cta.locked,
        }

      case 'disclaimer':
        if (!elements.disclaimer) return null
        const disclaimerElement: Partial<AdUnitElement> = {
          type: 'disclaimer',
          text: elements.disclaimer.text,
          locked: elements.disclaimer.locked,
        }
        if (elements.disclaimer.visibility !== undefined) {
          disclaimerElement.visibility = elements.disclaimer.visibility
        }
        if (elements.disclaimer.visibilityLock !== undefined) {
          disclaimerElement.visibilityLock = elements.disclaimer.visibilityLock
        }
        return disclaimerElement

      default:
        return null
    }
  }

  return {
    /**
     * Export NewData stores to CreativeContentData format for API
     */
    exportToCreativeContentData(): CreativeContentData | null {
      const creativeId = appStore.getCreativeId()
      if (!creativeId) {
        console.warn('Cannot export: No creative_id set in app store')
        return null
      }

      // Transform images
      const images: ImageMetadata[] = Object.values(imageStore.getAllImages()).map((asset) => ({
        id: asset.id,
        type: asset.type === 'logo' || asset.type === 'image' ? asset.type : 'image',
        name: asset.name || 'Unnamed',
        altText: asset.altText || `${asset.name || 'Unnamed'} altText`,
      }))

      // Transform layers
      const layers: Record<string, LayerData> = {}
      Object.entries(layerStore.getAllLayers()).forEach(([layerId, layer]) => {
        layers[layerId] = transformToCreativeLayer(layer)
      })

      // Transform ad units
      const adUnits: Record<string, AdUnitData> = {}
      Object.entries(adUnitsStore.getAllAdUnits()).forEach(([adUnitId, adUnit]) => {
        const elements: AdUnitElements = {}

        Object.entries(adUnit.elements).forEach(([elementKey, element]) => {
          const transformedElement = transformToCreativeElement(element, elementKey)
          if (transformedElement) {
            // Map to correct element type in AdUnitElements
            switch (elementKey) {
              case 'image':
                elements.image = transformedElement as ImageElement
                break
              case 'logo':
                elements.logo = transformedElement as LogoElement
                break
              case 'headline':
                elements.headline = transformedElement as TextElement
                break
              case 'subhead':
                elements.subhead = transformedElement as TextElement
                break
              case 'cta':
                elements.cta = transformedElement as TextElement
                break
              case 'background':
                elements.background = transformedElement as ImageElement
                break
              case 'disclaimer':
                elements.disclaimer = transformedElement as DisclaimerElement
                break
            }
          }
        })

        if (Object.keys(elements).length > 0) {
          adUnits[adUnitId] = { elements }
        }
      })

      const creativeData: CreativeContentData = {
        creative_id: creativeId,
        adUnits,
        layers,
        images,
      }

      console.log('📤 Exported to CreativeContentData:', {
        adUnits: Object.keys(adUnits).length,
        layers: Object.keys(layers).length,
        images: images.length,
      })

      return creativeData
    },

    /**
     * Import CreativeContentData to NewData stores
     */
    importFromCreativeContentData(creativeData: CreativeContentData): void {
      console.log('📥 Importing CreativeContentData to NewData stores...')

      // 1. Set creative ID in app store
      appStore.setCreativeId(creativeData.creative_id)

      // 2. Import layers
      Object.entries(creativeData.layers).forEach(([layerId, layerData]) => {
        const layer: Layer = {
          type: layerData.type,
          defaultValue: layerData.defaultValue,
          ...(layerData.visibility !== undefined && { visibility: layerData.visibility }),
        }
        layerStore.setLayer(layerId, layer)
      })

      // 3. Import images (if needed - assuming images are handled separately)
      // You might want to add image import logic here if needed

      // 4. Import ad units - only update existing ones
      Object.entries(creativeData.adUnits).forEach(([adUnitId, adUnitData]) => {
        const existingAdUnit = adUnitsStore.getAdUnit(adUnitId)
        if (!existingAdUnit) {
          console.warn(`AdUnit ${adUnitId} not found in store, skipping import`)
          return
        }

        // Transform and update each element
        const elementKeys = [
          'image',
          'logo',
          'headline',
          'subhead',
          'cta',
          'background',
          'disclaimer',
        ] as const

        elementKeys.forEach((elementKey) => {
          if (adUnitData.elements[elementKey]) {
            const transformedElement = transformFromCreativeElements(
              adUnitData.elements,
              elementKey,
            )
            if (transformedElement) {
              // Check if element exists in store
              const existingElement = adUnitsStore.getElement(adUnitId, elementKey)
              if (existingElement) {
                // Update existing element
                adUnitsStore.updateElement(adUnitId, elementKey, transformedElement)
              }
            }
          }
        })
      })

      console.log('✅ Import complete:', {
        adUnits: Object.keys(creativeData.adUnits).length,
        layers: Object.keys(creativeData.layers).length,
        images: creativeData.images.length,
      })
    },
  }
}
