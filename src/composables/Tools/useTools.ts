import { computed, ref, type ComputedRef } from 'vue'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useElements } from '@/composables/data/useElements'
import { useCropping } from '@/composables/Tools/useCropping'

// Tool selection state (singleton)
const selectedTool = ref<string>('text')
const activeSubView = ref<string>('default')

export const useTools = () => {
  const {
    setCurrentAdUnitId,
    setCurrentView,
    getCurrentView,
    getCurrentAdUnitId,
    getElementsByTag,
    getAdUnitNamesWithLockedTag,
    getAdUnitNamesWithVisibilityLockedTag,
    getElement,
    freeLayer,
  } = useCanvasData()
  const { getAllLayers, updateLayer } = useLayers()
  const { updateElement } = useElements()
  const { calculateCoverCrop, isCropping, cancelCrop } = useCropping()

  const switchToBulkMode = () => {
    console.log('🔄 Switching to bulk mode')

    // Auto-cancel any active cropping when switching to bulk mode
    if (isCropping.value) {
      console.log('⚠️ Auto-canceling crop when switching to bulk mode')
      cancelCrop()
    }

    setCurrentAdUnitId(null)
    setCurrentView('bulkMode')
  }

  const switchToFocusMode = (adUnitId: string) => {
    console.log('🔄 Switching to focus mode for:', adUnitId)

    if (!adUnitId) {
      console.warn('Focus mode requires an ad unit ID')
      return
    }

    setCurrentAdUnitId(adUnitId)
    setCurrentView('focusMode')
  }

  // Temporary: Keep override states for components that haven't migrated yet
  const overrideStates = {
    headlineOverride: ref(false),
    subheadOverride: ref(false),
    ctaOverride: ref(false),
    disclaimerOverride: ref(false), // Not used anymore but kept for compatibility
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
          // Bulk mode: update layer (simplified - no override logic)
          if (property === 'text') {
            updateLayer(fieldName, { defaultValue: value as string })
          } else {
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
  const lockedVisibilityElementsByTag = computed(() => {
    const result = {
      disclaimer: getAdUnitNamesWithVisibilityLockedTag('disclaimer'),
      disclaimerBG: getAdUnitNamesWithVisibilityLockedTag('disclaimerBG'),
    }
    console.log('🔍 lockedVisibilityElementsByTag computed:', result)
    return result
  })

  // Element availability checks (for conditional rendering in focus mode)
  const hasElementWithTag = (tag: string): boolean => {
    const currentView = getCurrentView()

    // In bulk mode, all elements are available
    if (currentView === 'bulkMode') return true

    // In focus mode, check if the current ad unit has the element
    const focusedAdUnitId = getCurrentAdUnitId()
    if (!focusedAdUnitId) return false

    const elements = getElementsByTag(focusedAdUnitId, tag)
    return elements.length > 0
  }

  const hasHeadline = computed(() => hasElementWithTag('headline'))
  const hasSubhead = computed(() => hasElementWithTag('subhead'))
  const hasCTA = computed(() => hasElementWithTag('cta'))
  const hasDisclaimer = computed(() => hasElementWithTag('disclaimer'))
  const hasImage = computed(() => hasElementWithTag('image'))
  const hasLogo = computed(() => hasElementWithTag('logo'))

  // Tool selection handlers
  const handleToolSelected = (tool: string) => {
    console.log('🎯 useTools.handleToolSelected called with:', tool)
    cancelCrop()
    selectedTool.value = tool
    activeSubView.value = 'default' // Reset to default view when switching tools
    console.log('🎯 useTools - selectedTool updated to:', selectedTool.value)
  }

  const handleNavigate = (subView: string) => {
    activeSubView.value = subView
  }

  return {
    switchToBulkMode,
    switchToFocusMode,
    // Smart v-models
    headlineValue,
    subheadValue,
    ctaValue,
    disclaimerValue,
    disclaimerVisibility,
    disclaimerBGVisibility,
    imageValue,
    // Temporary: Override states for old components
    overrideStates,
    // Computed locked lists
    lockedElementsByTag,
    lockedVisibilityElementsByTag,
    // Element availability
    hasHeadline,
    hasSubhead,
    hasCTA,
    hasDisclaimer,
    hasImage,
    hasLogo,
    // Tool selection state
    selectedTool,
    activeSubView,
    handleToolSelected,
    handleNavigate,
    // Utility functions
    freeLayer,
  }
}
