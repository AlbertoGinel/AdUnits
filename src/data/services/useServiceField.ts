import { useAdUnitStore } from '../stores/useAdUnitStore'
import { useAppStore } from '../stores/useAppStore'
import { useLayerStore } from '../stores/useLayerStore'
import type { EditableElementType } from '../../types/mainTypes'
import { hasVisibility, isTextElement, isImageElement } from '../../types/adUnitElementTypes'
import type { PropertyValueType, PropertiesOf } from '../../types/adUnitElementTypes'

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
  function getFieldValue<T extends EditableElementType, P extends PropertiesOf<T>>(
    elementKey: T,
    property: P,
  ): PropertyValueType<P> | null {
    const currentView = appStore.getCurrentView()

    if (currentView === 'focusMode') {
      // In focus mode: get from current AdUnit
      const adUnitId = appStore.getCurrentAdUnitId()
      if (!adUnitId) return null

      const element = adUnitsStore.getElement(adUnitId, elementKey)
      if (!element) return null

      // Handle different properties
      if (property === 'text' && isTextElement(element)) {
        return (element.text || '') as PropertyValueType<P>
      } else if (property === 'image' && isImageElement(element)) {
        return (element.image || '') as PropertyValueType<P>
      } else if (property === 'visibility' && hasVisibility(element)) {
        return (element.visibility ?? true) as PropertyValueType<P>
      } else if (property === 'locked') {
        return (element.locked ?? false) as PropertyValueType<P>
      } else if (property === 'visibilityLocked' && hasVisibility(element)) {
        return (element.visibilityLock ?? false) as PropertyValueType<P>
      }

      return null
    } else {
      // In bulk mode: get from layer store
      const layer = layerStore.getLayer(elementKey)
      if (!layer) return null

      // For visibility properties in bulk mode
      if (property === 'visibility') {
        return (layer.visibility ?? true) as PropertyValueType<P>
      }

      // For other properties, return the default value
      return (layer.defaultValue || '') as PropertyValueType<P>
    }
  }

  /**
   * Set field value based on element type, property, and current mode (counterpart to getFieldValue)
   */
  function updateFieldValue<T extends EditableElementType, P extends PropertiesOf<T>>(
    elementKey: T,
    property: P,
    value: PropertyValueType<P>,
  ): void {
    const currentView = appStore.getCurrentView()

    if (currentView === 'focusMode') {
      // In focus mode: update the current AdUnit element
      const adUnitId = appStore.getCurrentAdUnitId()
      if (!adUnitId) throw new Error('No ad unit selected')

      const element = adUnitsStore.getElement(adUnitId, elementKey)
      if (!element) throw new Error(`Element ${elementKey} not found`)

      // Handle different properties
      if (property === 'text' && isTextElement(element)) {
        adUnitsStore.updateElement(adUnitId, elementKey, { text: value as string })
      } else if (property === 'image' && isImageElement(element)) {
        adUnitsStore.updateElement(adUnitId, elementKey, { image: value as string })
      } else if (property === 'visibility' && hasVisibility(element)) {
        adUnitsStore.updateElement(adUnitId, elementKey, { visibility: value as boolean })
      } else if (property === 'locked') {
        adUnitsStore.updateElement(adUnitId, elementKey, { locked: value as boolean })
      } else if (property === 'visibilityLocked' && hasVisibility(element)) {
        adUnitsStore.updateElement(adUnitId, elementKey, { visibilityLock: value as boolean })
      } else {
        throw new Error(`Unsupported property ${property} for element ${elementKey}`)
      }
    } else {
      // In bulk mode: update layer store and cascade to unlocked units
      console.log('Bulk mode update not implemented yet')
    }
  }

  return {
    getFieldValue,
    updateFieldValue,
  }
}
