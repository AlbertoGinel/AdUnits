import { useCanvasStore } from '@/stores/canvas'
import { useImageStore } from '@/stores/useImageStore'
import type { CanvasElement, LayerDefinition } from '@/stores/canvas'
import type {
  CreativeContentData,
  AdUnitElements,
  ImageElement,
  LogoElement,
  TextElement,
  LayerData,
} from '@/types/creative'

/**
 * Helper composable for converting between Pinia store format and CreativeContentData format
 */
export function useHelperContentData() {
  const store = useCanvasStore()

  // Helper function to extract only CreativeContentData fields from elements
  const extractElementData = (
    element: CanvasElement,
  ): Partial<AdUnitElements[keyof AdUnitElements]> => {
    const baseData = {
      locked: element.locked,
    }

    switch (element.tag) {
      case 'image':
        return {
          ...baseData,
          image: element.image || '',
          ...(element.crop && { crop: element.crop }),
        }
      case 'logo':
        return {
          ...baseData,
          image: element.image || '',
        }
      case 'headline':
      case 'subhead':
      case 'cta':
        return {
          ...baseData,
          text: element.text || '',
        }
      case 'disclaimer': // ✅ Add this case
        return {
          ...baseData,
          text: element.text || '',
        }

      default:
        // For any other tags, treat as text if it has text, image if it has image
        if (element.image) {
          return {
            ...baseData,
            image: element.image,
            ...(element.crop && { crop: element.crop }),
          }
        } else {
          return {
            ...baseData,
            text: element.text || '',
          }
        }
    }
  }

  // Helper function to extract only CreativeContentData fields from layers
  const extractLayerData = (layer: LayerDefinition): LayerData => {
    const layerData: LayerData = {
      type: layer.type,
      defaultValue: layer.defaultValue,
    }

    // Only include optional fields if they exist
    if (layer.visibility !== undefined) {
      layerData.visibility = layer.visibility
    }
    if (layer.darkColour) {
      layerData.darkColour = layer.darkColour
    }
    if (layer.lightColour) {
      layerData.lightColour = layer.lightColour
    }

    return layerData
  }

  return {
    /**
     * Convert Pinia store data to CreativeContentData for API
     */
    exportToCreativeContentData: (): CreativeContentData | null => {
      if (!store.creative_id) {
        console.warn('Cannot export: No creative_id set')
        return null
      }

      const imageStore = useImageStore()

      const creativeData: CreativeContentData = {
        creative_id: store.creative_id,
        adUnits: {},
        layers: {},
        images: imageStore.getAllImages.map((asset) => ({
          id: asset.id || asset.url,
          type: asset.type === 'logo' || asset.type === 'image' ? asset.type : 'image',
          name: asset.name || 'Unnamed',
          altText: asset.altText || `${asset.name || 'Unnamed'} altText`,
        })),
      }

      // Process ad units - only extract relevant element data
      Object.entries(store.adUnits).forEach(([adUnitId, adUnit]) => {
        const elements: AdUnitElements = {}

        Object.entries(adUnit.elements).forEach(([, element]) => {
          const extractedData = extractElementData(element)

          // Ensure extractedData is valid before proceeding
          if (!extractedData) return

          // Map element tags to CreativeContentData structure
          switch (element.tag) {
            case 'image':
              if ('image' in extractedData && extractedData.image !== undefined) {
                elements.image = extractedData as ImageElement
              }
              break
            case 'logo':
              if ('image' in extractedData && extractedData.image !== undefined) {
                elements.logo = extractedData as LogoElement
              }
              break
            case 'headline':
              if ('text' in extractedData && extractedData.text !== undefined) {
                elements.headline = extractedData as TextElement
              }
              break
            case 'subhead':
              if ('text' in extractedData && extractedData.text !== undefined) {
                elements.subhead = extractedData as TextElement
              }
              break
            case 'cta':
              if ('text' in extractedData && extractedData.text !== undefined) {
                elements.cta = extractedData as TextElement
              }
              break
            case 'background':
              if ('image' in extractedData && extractedData.image !== undefined) {
                elements.background = extractedData as ImageElement
              }
              break
            // Note: Other element tags are ignored as they're not part of CreativeContentData
          }
        })

        if (Object.keys(elements).length > 0) {
          creativeData.adUnits[adUnitId] = { elements }
        }
      })

      // Process layers - only extract relevant layer data
      Object.entries(store.layers).forEach(([layerId, layer]) => {
        creativeData.layers[layerId] = extractLayerData(layer)
      })

      return creativeData
    },

    /**
     * Import CreativeContentData to Pinia stores
     */
    importFromCreativeContentData: (creativeData: CreativeContentData) => {
      console.log('💾 Importing CreativeContentData to stores...')

      // 1. Set creative ID
      store.creative_id = creativeData.creative_id

      // 2. Set layers from creativeData (merge with existing)
      Object.entries(creativeData.layers).forEach(([layerId, layerData]) => {
        store.layers[layerId] = layerData
      })
      console.log(`📚 Layers: ${Object.keys(creativeData.layers).length}`)

      // 3. Import ad units from creativeData - only update existing adUnits
      Object.entries(creativeData.adUnits).forEach(([adUnitId, adUnitFromCD]) => {
        // Only work with existing adUnits - don't create new ones with magic numbers
        if (!store.adUnits[adUnitId]) {
          console.warn(`AdUnit ${adUnitId} not found in store, skipping import`)
          return
        }

        // Convert CreativeContentData elements to Canvas elements
        const elements = adUnitFromCD.elements

        // Process each element type - only set the properties that exist in CreativeContentData
        if (elements.image) {
          const imageElement: Partial<CanvasElement> = {
            tag: 'image',
            type: 'image',
            image: elements.image.image,
            locked: elements.image.locked,
          }
          if (elements.image.crop) {
            imageElement.crop = elements.image.crop
          }

          if (!store.adUnits[adUnitId].elements['image']) {
            store.adUnits[adUnitId].elements['image'] = imageElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['image'], imageElement)
          }
        }

        if (elements.logo) {
          const logoElement: Partial<CanvasElement> = {
            tag: 'logo',
            type: 'image',
            image: elements.logo.image,
            locked: elements.logo.locked,
          }

          if (!store.adUnits[adUnitId].elements['logo']) {
            store.adUnits[adUnitId].elements['logo'] = logoElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['logo'], logoElement)
          }
        }

        if (elements.headline) {
          const headlineElement: Partial<CanvasElement> = {
            tag: 'headline',
            type: 'text',
            text: elements.headline.text,
            locked: elements.headline.locked,
          }

          if (!store.adUnits[adUnitId].elements['headline']) {
            store.adUnits[adUnitId].elements['headline'] = headlineElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['headline'], headlineElement)
          }
        }

        if (elements.subhead) {
          const subheadElement: Partial<CanvasElement> = {
            tag: 'subhead',
            type: 'text',
            text: elements.subhead.text,
            locked: elements.subhead.locked,
          }

          if (!store.adUnits[adUnitId].elements['subhead']) {
            store.adUnits[adUnitId].elements['subhead'] = subheadElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['subhead'], subheadElement)
          }
        }

        if (elements.cta) {
          const ctaElement: Partial<CanvasElement> = {
            tag: 'cta',
            type: 'text',
            text: elements.cta.text,
            locked: elements.cta.locked,
          }

          if (!store.adUnits[adUnitId].elements['cta']) {
            store.adUnits[adUnitId].elements['cta'] = ctaElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['cta'], ctaElement)
          }
        }

        if (elements.background) {
          const backgroundElement: Partial<CanvasElement> = {
            tag: 'background',
            type: 'image',
            image: elements.background.image,
            locked: elements.background.locked,
          }
          if (elements.background.crop) {
            backgroundElement.crop = elements.background.crop
          }

          if (!store.adUnits[adUnitId].elements['background']) {
            store.adUnits[adUnitId].elements['background'] = backgroundElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['background'], backgroundElement)
          }
        }

        if (elements.disclaimer) {
          const disclaimerElement: Partial<CanvasElement> = {
            tag: 'disclaimer',
            type: 'text',
            text: elements.disclaimer.text,
            locked: elements.disclaimer.locked,
          }
          // Add visibility properties if they exist
          if (elements.disclaimer.visibility !== undefined) {
            disclaimerElement.visibility = elements.disclaimer.visibility
          }
          if (elements.disclaimer.visibilityLock !== undefined) {
            disclaimerElement.visibilityLock = elements.disclaimer.visibilityLock
          }

          if (!store.adUnits[adUnitId].elements['disclaimer']) {
            store.adUnits[adUnitId].elements['disclaimer'] = disclaimerElement as CanvasElement
          } else {
            Object.assign(store.adUnits[adUnitId].elements['disclaimer'], disclaimerElement)
          }
        }
      })

      console.log(`💾 Stores populated from CreativeContentData`)
      console.log(`📦 Ad Units: ${Object.keys(creativeData.adUnits).length}`)
    },
  }
}
