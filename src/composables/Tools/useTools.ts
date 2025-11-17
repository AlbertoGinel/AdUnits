import { computed, ref, type ComputedRef } from 'vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useElements } from '@/composables/data/useElements'

export const useTools = () => {
  const {
    setCurrentAdUnitId,
    setCurrentView,
    getCurrentView,
    getCurrentAdUnitId,
    getElementsByTag,
    getAdUnitNamesWithLockedTag,
    freeLayer,
  } = useCanvasData()
  const { getAllLayers, updateLayer } = useLayers()
  const { updateElement } = useElements()

  const switchMode = (mode: 'bulkMode' | 'focusMode', id?: string | null) => {
    if (mode === 'bulkMode') {
      // First set the ID, then the view (as you requested)
      setCurrentAdUnitId(null)
      setCurrentView('bulkMode')
    } else if (mode === 'focusMode') {
      if (!id) {
        console.warn('Focus mode requires an ad unit ID')
        return
      }
      // First set the ID, then the view (as you requested)
      setCurrentAdUnitId(id)
      setCurrentView('focusMode')
    }
  }

  // Override states for each field (must be defined first)
  const overrideStates = {
    headlineOverride: ref(false),
    subheadOverride: ref(false),
    ctaOverride: ref(false),
    disclaimerOverride: ref(false),
  }

  // Function overloads for proper TypeScript typing
  function createFieldModel(fieldName: string, property: 'text'): ComputedRef<string>
  function createFieldModel(fieldName: string, property: 'visibility'): ComputedRef<boolean>

  // Flexible v-model generator for any field property with override support
  function createFieldModel(
    fieldName: string,
    property: 'text' | 'visibility' = 'text',
  ): ComputedRef<string | boolean> {
    return computed({
      get: () => {
        const currentView = getCurrentView()
        const currentAdUnitId = getCurrentAdUnitId()

        if (currentView === 'focusMode' && currentAdUnitId) {
          // Focus mode: get from current ad unit element
          const elements = getElementsByTag(currentAdUnitId, fieldName)
          if (property === 'text') {
            return elements[0]?.text || ''
          } else {
            return elements[0]?.visibility ?? true
          }
        } else {
          // Bulk mode: get from layer value
          const layers = getAllLayers()
          if (property === 'text') {
            return layers[fieldName]?.defaultValue || ''
          } else {
            return layers[fieldName]?.visibility ?? true
          }
        }
      },
      set: (value: string | boolean) => {
        const currentView = getCurrentView()
        const currentAdUnitId = getCurrentAdUnitId()

        if (currentView === 'focusMode' && currentAdUnitId) {
          // Focus mode: update current ad unit element
          const elementUpdates: { text?: string; locked?: boolean; visibility?: boolean } = {}

          if (property === 'text') {
            elementUpdates.text = value as string
            elementUpdates.locked = true
            // Set default visibility for disclaimer elements
            if (fieldName === 'disclaimer') {
              elementUpdates.visibility = true
            }
          } else {
            elementUpdates.visibility = value as boolean
          }

          updateElement(currentAdUnitId, fieldName, elementUpdates)
        } else {
          // Bulk mode: update layer
          if (property === 'text') {
            // Check if override is enabled for text fields
            const overrideKey = `${fieldName}Override` as keyof typeof overrideStates
            const isOverrideEnabled = overrideStates[overrideKey]?.value

            if (isOverrideEnabled) {
              // Override mode: free all locked elements first, then update
              freeLayer(fieldName)
              updateLayer(fieldName, { defaultValue: value as string })
              // Reset override after use
              overrideStates[overrideKey].value = false
            } else {
              // Normal bulk mode: update layer (respects existing locks)
              updateLayer(fieldName, { defaultValue: value as string })
            }
          } else {
            // Visibility updates don't use override logic (yet)
            updateLayer(fieldName, { visibility: value as boolean })
          }
        }
      },
    })
  }

  // Create all field models using the generator
  const headlineValue = createFieldModel('headline', 'text')
  const subheadValue = createFieldModel('subhead', 'text')
  const ctaValue = createFieldModel('cta', 'text')
  const disclaimerValue = createFieldModel('disclaimer', 'text')

  // Create visibility model for disclaimer using the same generator
  const disclaimerVisibility = createFieldModel('disclaimer', 'visibility')

  // Computed lists of locked elements by tag
  const lockedElementsByTag = computed(() => ({
    headline: getAdUnitNamesWithLockedTag('headline'),
    subhead: getAdUnitNamesWithLockedTag('subhead'),
    cta: getAdUnitNamesWithLockedTag('cta'),
    disclaimer: getAdUnitNamesWithLockedTag('disclaimer'),
  }))

  return {
    switchMode,
    // Smart v-models
    headlineValue,
    subheadValue,
    ctaValue,
    disclaimerValue,
    disclaimerVisibility,
    // Override states
    overrideStates,
    // Computed locked lists
    lockedElementsByTag,
    // Utility functions
    freeLayer,
  }
}
