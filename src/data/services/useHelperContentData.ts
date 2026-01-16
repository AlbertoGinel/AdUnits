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
//import type { Layer } from '../../types/mainTypes'
import type { Layer } from '@/types/LayerTypes'

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
  ): AdUnitElements[keyof AdUnitElements] | null {
    switch (elementKey) {
      case 'image':
      case 'background':
        if (!('imageID' in element)) return null
        const imageElement: ImageElement = {
          imageID: element.imageID,
          locked: 'locked' in element ? element.locked : false,
          ...('cropData' in element && element.cropData ? { cropData: element.cropData } : {}),
        }
        return imageElement

      case 'logo':
        if (!('imageID' in element)) return null
        const logoElement: LogoElement = {
          imageID: element.imageID,
          locked: 'locked' in element ? element.locked : false,
        }
        return logoElement

      case 'headline':
      case 'subhead':
      case 'cta':
        if (!('text' in element)) return null
        const textElement: TextElement = {
          text: element.text,
          locked: 'locked' in element ? element.locked : false,
        }
        return textElement

      case 'disclaimer':
        if (!('text' in element)) return null
        const disclaimerElement: DisclaimerElement = {
          text: element.text,
          locked: 'locked' in element ? element.locked : false,
          visibility: 'visibility' in element ? (element.visibility ?? true) : true,
          visibilityLock: 'visibilityLock' in element ? (element.visibilityLock ?? false) : false,
        }
        return disclaimerElement

      default:
        return null
    }
  }

  /**
   * Transform Layer to CreativeContentData layer format
   */
  function transformToCreativeLayer(layer: Layer): LayerData {
    const layerId = layer.id

    // Text elements: headline, subhead, cta
    if (layerId === 'headline' || layerId === 'subhead' || layerId === 'cta') {
      if (!('text' in layer)) throw new Error(`Text layer ${layerId} missing text property`)
      return {
        id: layerId,
        text: layer.text,
        locked: layer.locked,
      }
    }

    // Disclaimer element
    if (layerId === 'disclaimer') {
      if (!('text' in layer)) throw new Error('Disclaimer layer missing text property')
      return {
        id: 'disclaimer',
        text: layer.text,
        visibility: 'visibility' in layer ? layer.visibility : true,
        locked: layer.locked,
        visibilityLock: 'visibilityLock' in layer ? layer.visibilityLock : false,
      }
    }

    // DisclaimerBG element
    if (layerId === 'disclaimerBG') {
      return {
        id: 'disclaimerBG',
        visibility: 'visibility' in layer ? layer.visibility : true,
        locked: layer.locked,
      }
    }

    // Image elements: logo, image
    if (layerId === 'logo' || layerId === 'image') {
      if (!('imageID' in layer)) throw new Error(`Image layer ${layerId} missing imageID property`)
      return {
        id: layerId,
        imageID: layer.imageID,
        locked: layer.locked,
      }
    }

    throw new Error(`Unknown layer type: ${layerId}`)
  }

  /**
   * Transform CreativeContentData elements back to AdUnitElement format
   * Returns only the editable properties to be merged with existing elements
   */
  function transformFromCreativeElements(
    elements: AdUnitElements,
    elementKey: string,
  ): Partial<AdUnitElement> | null {
    switch (elementKey) {
      case 'image':
        if (!elements.image) return null
        return {
          imageID: elements.image.imageID,
          locked: elements.image.locked,
          ...(elements.image.cropData && { cropData: elements.image.cropData }),
        }

      case 'logo':
        if (!elements.logo) return null
        return {
          imageID: elements.logo.imageID,
          locked: elements.logo.locked,
        }

      case 'headline':
        if (!elements.headline) return null
        return {
          text: elements.headline.text,
          locked: elements.headline.locked,
        }

      case 'subhead':
        if (!elements.subhead) return null
        return {
          text: elements.subhead.text,
          locked: elements.subhead.locked,
        }

      case 'cta':
        if (!elements.cta) return null
        return {
          text: elements.cta.text,
          locked: elements.cta.locked,
        }

      case 'disclaimer':
        if (!elements.disclaimer) return null
        return {
          text: elements.disclaimer.text,
          locked: elements.disclaimer.locked,
          visibility: elements.disclaimer.visibility,
          visibilityLock: elements.disclaimer.visibilityLock,
        }

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
        imageID: asset.imageID,
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
      Object.entries(adUnitsStore.getAllAdUnits()).forEach(([adUnitID, adUnit]) => {
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
              case 'disclaimer':
                elements.disclaimer = transformedElement as DisclaimerElement
                break
            }
          }
        })

        if (Object.keys(elements).length > 0) {
          adUnits[adUnitID] = { elements }
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
        let layer: Layer

        // Text layers: headline, subhead, cta
        if (layerData.id === 'headline' || layerData.id === 'subhead' || layerData.id === 'cta') {
          layer = {
            id: layerData.id,
            text: layerData.text,
            locked: layerData.locked,
          }
        }
        // Disclaimer layer
        else if (layerData.id === 'disclaimer') {
          const disclaimerData = layerData as Extract<LayerData, { id: 'disclaimer' }>
          layer = {
            id: 'disclaimer',
            text: disclaimerData.text,
            visibility: disclaimerData.visibility,
            locked: disclaimerData.locked,
            visibilityLock: disclaimerData.visibilityLock,
          }
        }
        // DisclaimerBG layer
        else if (layerData.id === 'disclaimerBG') {
          const disclaimerBGData = layerData as Extract<LayerData, { id: 'disclaimerBG' }>
          layer = {
            id: 'disclaimerBG',
            visibility: disclaimerBGData.visibility,
            locked: disclaimerBGData.locked,
          }
        }
        // Image layers: logo, image
        else if (layerData.id === 'logo' || layerData.id === 'image') {
          layer = {
            id: layerData.id,
            imageID: layerData.id,
            locked: layerData.locked,
          }
        } else {
          console.warn(`Unknown layer type: ${layerData.id}`)
          return
        }

        layerStore.setLayer(layerId as typeof layerData.id, layer)
      })

      // 3. Import images (if needed - assuming images are handled separately)
      // You might want to add image import logic here if needed

      // 4. Import ad units - only update existing ones
      Object.entries(creativeData.adUnits).forEach(([adUnitID, adUnitData]) => {
        const existingAdUnit = adUnitsStore.getAdUnit(adUnitID)
        if (!existingAdUnit) {
          console.warn(`AdUnit ${adUnitID} not found in store, skipping import`)
          return
        }

        //EDITABLE: ['headline', 'logo', 'subhead', 'cta', 'image', 'disclaimer', 'disclaimerBG'] as const,

        // Transform and update each element
        const elementKeys = ['image', 'logo', 'headline', 'subhead', 'cta', 'disclaimer'] as const

        elementKeys.forEach((elementKey) => {
          if (adUnitData.elements[elementKey]) {
            const transformedElement = transformFromCreativeElements(
              adUnitData.elements,
              elementKey,
            )
            if (transformedElement) {
              // Check if element exists in store
              const existingElement = adUnitsStore.getElement(adUnitID, elementKey)
              if (existingElement) {
                // Update existing element
                adUnitsStore.updateElement(adUnitID, elementKey, transformedElement)
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
