import { useAdUnitStore } from '../stores/useAdUnitStore'
import { useAppStore } from '../stores/useAppStore'
import { useLayerStore } from '../stores/useLayerStore'
import type { EditableElementType, EditablePropertiesOf } from '../../types/mainTypes'
import {
  type ElementPropertyValueType,
  type AdUnitElementMap,
  type AdUnitElement,
  lockFieldMap,
} from '../../types/adUnitElementTypes'
import type { LayerObjectMap } from '../../types/LayerTypes'

/**
 * Service for cross-store data operations
 */
export function useFieldService() {
  const adUnitsStore = useAdUnitStore()
  const appStore = useAppStore()
  const layerStore = useLayerStore()

  /**
   * Cascade update to all unlocked AdUnits
   * Updates all AdUnits that have the element and are not locked
   */
  function cascadeUpdate<T extends EditableElementType, P extends EditablePropertiesOf<T>>(
    elementKey: T,
    property: P,
    value: ElementPropertyValueType<T, P>,
  ): void {
    // Get all unlocked AdUnits for this property (optimized query)
    const unlockedAdUnitIds = adUnitsStore.getAdUnitsByPropertyLock(elementKey, property, false)
    let updatedCount = 0

    unlockedAdUnitIds.forEach((adUnitId) => {
      // Skip if element doesn't exist
      const element = adUnitsStore.getElement(adUnitId, elementKey)
      if (!element) return

      // Update the element
      adUnitsStore.updateElement(adUnitId, elementKey, {
        [property]: value,
      } as Partial<AdUnitElement>)

      updatedCount++
    })

    console.log(`🔄 Cascaded ${String(elementKey)}.${String(property)} to ${updatedCount} AdUnits`)
  }

  /**
   * Override locked AdUnits: unlock all and cascade layer value
   * Two-step process: unlock all AdUnits, then apply current layer value to all
   *
   * @example
   * overrideLockedAdUnits('headline', 'text')
   * // Unlocks all headlines, then sets them to current layer headline text
   */
  function overrideLockedAdUnits<T extends EditableElementType, P extends EditablePropertiesOf<T>>(
    elementKey: T,
    property: P,
  ): void {
    // Step 1: Unlock all AdUnits for this property
    adUnitsStore.cascadeUnlock(elementKey, property)

    // Step 2: Get current layer value
    const layer = layerStore.getLayer(elementKey)
    if (!layer) return

    const layerValue = layer[property as P & keyof LayerObjectMap[T]]

    // Step 3: Cascade layer value to all (now unlocked) AdUnits
    if (layerValue !== undefined) {
      cascadeUpdate(elementKey, property, layerValue as ElementPropertyValueType<T, P>)
    }
  }

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
      const adUnitID = appStore.getCurrentAdUnitId()
      if (!adUnitID) return null

      const element = adUnitsStore.getElement(adUnitID, elementKey)
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
      return (typedLayer[property as P & keyof LayerObjectMap[T]] ??
        null) as ElementPropertyValueType<T, P> | null
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
      const adUnitID = appStore.getCurrentAdUnitId()
      if (!adUnitID) throw new Error('No ad unit selected')

      const element = adUnitsStore.getElement(adUnitID, elementKey)
      if (!element) throw new Error(`Element ${elementKey} not found`)

      // Update with type-safe partial object
      adUnitsStore.updateElement(adUnitID, elementKey, {
        [property]: value,
      } as Partial<typeof element>)

      const lockField = lockFieldMap[property as keyof typeof lockFieldMap]
      if (lockField) {
        adUnitsStore.updateElement(adUnitID, elementKey, {
          [lockField]: true,
        } as Partial<typeof element>)
      }
    } else {
      // In bulk mode: update layer store and cascade to unlocked units
      layerStore.updateLayer(elementKey, {
        [property]: value,
      } as unknown as Partial<LayerObjectMap[T]>)

      // Cascade to all unlocked ad units
      cascadeUpdate(elementKey, property, value)
    }
  }

  return {
    getFieldValue,
    updateFieldValue,
    overrideLockedAdUnits,
  }
}
