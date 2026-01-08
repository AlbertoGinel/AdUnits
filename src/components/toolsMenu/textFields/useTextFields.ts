import { computed, ref } from 'vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useImageManager } from '@/composables/setupImages/useImageManager'

interface TextFieldConfig {
  type: 'input' | 'textarea'
  hasVisibility: boolean
  hasBgVisibility: boolean
  maxLength: number
  placeholder: string
  customMessages: {
    text: string
    visibility: string
    bgVisibility: string
  }
}

export function useTextField(fieldName: string, config: TextFieldConfig) {
  const tools = useTools()
  const {
    getCurrentView,
    getAdUnitNamesWithLockedTag,
    getAdUnitNamesWithVisibilityLockedTag,
    freeLayer,
    updateElement,
    getAdUnits,
    getElement,
    calculateAutoCrop,
  } = useCanvasData()
  const { updateLayer } = useLayers()
  const imageManager = useImageManager()

  // Simple getters - no error throwing
  const getFieldValue = () => {
    switch (fieldName) {
      case 'headline':
        return tools.headlineValue
      case 'subhead':
        return tools.subheadValue
      case 'cta':
        return tools.ctaValue
      case 'disclaimer':
        return tools.disclaimerValue
      default:
        return ref('')
    }
  }

  // Always return the same predictable shape
  // Override functionality - replaces checkbox approach
  const overrideAllLocked = () => {
    console.log(`🔓 Override all locked ${fieldName} elements`)

    // Get current field value
    const currentValue = getFieldValue().value
    if (!currentValue) {
      console.warn(`No value to override for ${fieldName}`)
      return
    }

    // Free all locked elements first
    freeLayer(fieldName)

    // Update layer with current value (applies to all ad units)
    updateLayer(fieldName, { defaultValue: currentValue })

    // Special handling for images
    if (fieldName === 'image' && typeof currentValue === 'string') {
      const allAdUnits = getAdUnits()
      Object.keys(allAdUnits).forEach((adUnitId) => {
        const element = getElement(adUnitId, fieldName)
        if (element?.type === 'image') {
          // Get actual image dimensions from image manager
          const imageElement = imageManager.getImageOptimized(currentValue)
          if (imageElement) {
            const crop = calculateAutoCrop(
              imageElement.naturalWidth,
              imageElement.naturalHeight,
              element.width || 0,
              element.height || 0,
            )
            updateElement(adUnitId, fieldName, {
              image: currentValue,
              crop: crop || undefined,
              locked: false,
            })
          }
        }
      })
    }

    console.log(`✅ Override complete for ${fieldName}`)
  }

  return {
    // Basic field properties
    fieldName,
    config,
    fieldValue: getFieldValue(),
    placeholder: config.placeholder,
    isBulkMode: computed(() => getCurrentView() === 'bulkMode'),

    // Character counting
    characterCount: computed(() => getFieldValue().value?.length || 0),
    isOverLimit: computed(() => (getFieldValue().value?.length || 0) > config.maxLength),

    // Text locks (simplified - no override states)
    lockedElements: computed(() => getAdUnitNamesWithLockedTag(fieldName)),
    overrideAllLocked, // New button action

    // Visibility (always present - enabled based on config.hasVisibility)
    visibility: fieldName === 'disclaimer' ? tools.disclaimerVisibility : ref(false),
    lockedVisibilityElements: computed(() => getAdUnitNamesWithVisibilityLockedTag(fieldName)),

    // Background visibility (always present - enabled based on config.hasBgVisibility)
    bgVisibility: fieldName === 'disclaimer' ? tools.disclaimerBGVisibility : ref(false),
    lockedBgElements: computed(() => getAdUnitNamesWithVisibilityLockedTag('disclaimerBG')),

    // Utility function
    getCustomMessage: (type: 'text' | 'visibility' | 'bgVisibility') => config.customMessages[type],
  }
}
