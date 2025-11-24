import { computed, ref, type ComputedRef } from 'vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useElements } from '@/composables/data/useElements'
import { useCropping } from '@/composables/Tools/useCropping'

// Shared callback for zoom updates (singleton)
let sharedOnModeChangeCallback:
  | ((mode: 'bulkMode' | 'focusMode', id?: string | null) => void)
  | null = null

export const useTools = () => {
  const {
    setCurrentAdUnitId,
    setCurrentView,
    getCurrentView,
    getCurrentAdUnitId,
    getElementsByTag,
    getAdUnitNamesWithLockedTag,
    getAdUnitNamesWithVisibilityLockedTag,
    getAdUnits,
    getElement,
    freeLayer,
  } = useCanvasData()
  const { getAllLayers, updateLayer } = useLayers()
  const { updateElement } = useElements()
  const { calculateCoverCrop } = useCropping()

  const setOnModeChange = (
    callback: (mode: 'bulkMode' | 'focusMode', id?: string | null) => void,
  ) => {
    console.log('🔧 setOnModeChange: Callback registered (SINGLETON)')
    sharedOnModeChangeCallback = callback
  }

  const switchMode = (mode: 'bulkMode' | 'focusMode', id?: string | null) => {
    console.log('🔄 switchMode called:', mode, id)
    if (mode === 'bulkMode') {
      setCurrentAdUnitId(null)
      setCurrentView('bulkMode')
      console.log('→ Triggering callback for bulkMode')
      sharedOnModeChangeCallback?.('bulkMode')
    } else if (mode === 'focusMode') {
      if (!id) {
        console.warn('Focus mode requires an ad unit ID')
        return
      }
      setCurrentAdUnitId(id)
      setCurrentView('focusMode')
      console.log('→ Triggering callback for focusMode:', id)
      sharedOnModeChangeCallback?.('focusMode', id)
    }
  }

  // Override states for each field (must be defined first)
  const overrideStates = {
    headlineOverride: ref(false),
    subheadOverride: ref(false),
    ctaOverride: ref(false),
    disclaimerOverride: ref(false),
    disclaimerVisibilityOverride: ref(false),
    disclaimerBGVisibilityOverride: ref(false),
    imageOverride: ref(false),
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
          if (property === 'text') {
            // Handle image changes with auto-crop
            if (fieldName === 'image' && typeof value === 'string') {
              const element = getElement(currentAdUnitId, fieldName)
              if (element?.type === 'image') {
                const crop = calculateCoverCrop(value, element.width || 0, element.height || 0)

                if (crop) {
                  updateElement(currentAdUnitId, fieldName, {
                    text: value,
                    crop: crop,
                    locked: true,
                  })
                  console.log('🎨 Focus mode: Image updated with auto-crop', {
                    imageId: value,
                    crop,
                  })
                } else {
                  console.warn('Could not calculate crop, updating without crop')
                  updateElement(currentAdUnitId, fieldName, {
                    text: value,
                    locked: true,
                  })
                }
              }
            } else {
              // Regular text update
              const elementUpdates: {
                text?: string
                locked?: boolean
                visibility?: boolean
              } = {
                text: value as string,
                locked: true,
              }

              // Set default visibility for disclaimer elements
              if (fieldName === 'disclaimer') {
                elementUpdates.visibility = true
              }

              updateElement(currentAdUnitId, fieldName, elementUpdates)
            }
          } else {
            // Visibility update
            updateElement(currentAdUnitId, fieldName, {
              visibility: value as boolean,
              visibilityLock: true,
            })
          }
        } else {
          // Bulk mode: update layer
          if (property === 'text') {
            // Check if override is enabled for text fields
            const overrideKey = `${fieldName}Override` as keyof typeof overrideStates
            const isOverrideEnabled = overrideStates[overrideKey]?.value

            if (isOverrideEnabled) {
              // Override mode: free all locked elements first, then update
              if (fieldName === 'image' && typeof value === 'string') {
                // Image override: auto-crop for each ad unit's dimensions
                const allAdUnits = getAdUnits()
                Object.keys(allAdUnits).forEach((adUnitId) => {
                  const element = getElement(adUnitId, fieldName)
                  if (element?.type === 'image') {
                    const crop = calculateCoverCrop(value, element.width || 0, element.height || 0)

                    if (crop) {
                      updateElement(adUnitId, fieldName, {
                        text: value,
                        crop: crop,
                        locked: false,
                      })
                    }
                  }
                })
                console.log('🔓 Override: Updated all images with auto-crop (freed locks)')
              } else {
                // Regular text override
                freeLayer(fieldName)
                updateLayer(fieldName, { defaultValue: value as string })
              }
              // Reset override after use
              overrideStates[overrideKey].value = false
            } else {
              // Normal bulk mode: update layer (respects existing locks)
              updateLayer(fieldName, { defaultValue: value as string })
            }
          } else {
            // Visibility property
            const overrideKey = `${fieldName}VisibilityOverride` as keyof typeof overrideStates
            const isOverrideEnabled = overrideStates[overrideKey]?.value

            if (isOverrideEnabled) {
              // Override mode: Unlock all visibility locks and update all elements
              const allAdUnits = getAdUnits()
              Object.keys(allAdUnits).forEach((adUnitId) => {
                const elements = getElementsByTag(adUnitId, fieldName)
                elements.forEach(() => {
                  updateElement(adUnitId, fieldName, {
                    visibility: value as boolean,
                    visibilityLock: false,
                  })
                })
              })

              // Update the layer too
              updateLayer(fieldName, { visibility: value as boolean })

              // Reset override state
              overrideStates[overrideKey].value = false
            } else {
              // Normal bulk mode: update layer (respects existing visibility locks)
              updateLayer(fieldName, { visibility: value as boolean })
            }
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
  const disclaimerBGVisibility = createFieldModel('disclaimerBG', 'visibility')

  // Create image v-model (uses text property for image ID)
  const imageValue = createFieldModel('image', 'text')
  // Computed lists of locked elements by tag
  const lockedElementsByTag = computed(() => ({
    headline: getAdUnitNamesWithLockedTag('headline'),
    subhead: getAdUnitNamesWithLockedTag('subhead'),
    cta: getAdUnitNamesWithLockedTag('cta'),
    disclaimer: getAdUnitNamesWithLockedTag('disclaimer'),
    image: getAdUnitNamesWithLockedTag('image'),
  }))

  // Computed lists of visibility locked elements by tag
  const lockedVisibilityElementsByTag = computed(() => ({
    disclaimer: getAdUnitNamesWithVisibilityLockedTag('disclaimer'),
    disclaimerBG: getAdUnitNamesWithVisibilityLockedTag('disclaimerBG'),
  }))

  return {
    switchMode,
    setOnModeChange,
    // Smart v-models
    headlineValue,
    subheadValue,
    ctaValue,
    disclaimerValue,
    disclaimerVisibility,
    disclaimerBGVisibility,
    imageValue,
    // Override states
    overrideStates,
    // Computed locked lists
    lockedElementsByTag,
    lockedVisibilityElementsByTag,
    // Utility functions
    freeLayer,
  }
}
