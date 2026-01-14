import { useAdUnitStore } from '../stores/useAdUnitStore'
import { useAppStore } from '../stores/useAppStore'
import { useLayerStore } from '../stores/useLayerStore'
import type { EditableElementType, EditablePropertiesOf } from '../../types/mainTypes'
import type { ElementPropertyValueType, AdUnitElementMap } from '../../types/adUnitElementTypes'
import type { LayerObjectMap } from '../../types/LayerTypes'

/**
 * Service for cross-store data operations
 */
export function useServicesField() {
  const adUnitsStore = useAdUnitStore()
  const appStore = useAppStore()
  const layerStore = useLayerStore()

  /**
   * Get property value based on element type, property, and current mode
   */
  function getFieldValue<T extends EditableElementType, P extends EditablePropertiesOf<T>>(
    elementKey: T,
    property: P,
  ): ElementPropertyValueType<T, P> | null {
    const currentView = appStore.getCurrentView()

    if (currentView === 'focusMode') {
      // In focus mode: get from current AdUnit
      const adUnitId = appStore.getCurrentAdUnitId()
      if (!adUnitId) return null

      const element = adUnitsStore.getElement(adUnitId, elementKey)
      if (!element) return null

      // Cast to specific element type for property access
      const typedElement = element as AdUnitElementMap[T]
      return (typedElement[property as keyof AdUnitElementMap[T]] ??
        null) as ElementPropertyValueType<T, P> | null
    } else {
      // In bulk mode: get from layer store
      const layer = layerStore.getLayer(elementKey)
      if (!layer) return null

      // Cast to specific layer type for property access
      const typedLayer = layer as LayerObjectMap[T]
      return (typedLayer[property as keyof LayerObjectMap[T]] ?? null) as ElementPropertyValueType<
        T,
        P
      > | null
    }
  }

  /**
   * Set field value based on element type, property, and current mode (counterpart to getFieldValue)
   */
  function updateFieldValue<T extends EditableElementType, P extends EditablePropertiesOf<T>>(
    elementKey: T,
    property: P,
    value: ElementPropertyValueType<T, P>,
  ): void {
    const currentView = appStore.getCurrentView()

    if (currentView === 'focusMode') {
      // In focus mode: update the current AdUnit element
      const adUnitId = appStore.getCurrentAdUnitId()
      if (!adUnitId) throw new Error('No ad unit selected')

      const element = adUnitsStore.getElement(adUnitId, elementKey)
      if (!element) throw new Error(`Element ${elementKey} not found`)

      // Update with type-safe partial object
      adUnitsStore.updateElement(adUnitId, elementKey, {
        [property]: value,
      } as Partial<typeof element>)
    } else {
      // In bulk mode: update layer store and cascade to unlocked units
      layerStore.updateLayer(elementKey, {
        [property]: value,
      } as unknown as Partial<LayerObjectMap[T]>)

      // TODO: Cascade to all unlocked ad units
      console.log('Bulk mode cascade not implemented yet')
    }
  }

  return {
    getFieldValue,
    updateFieldValue,
  }
}
