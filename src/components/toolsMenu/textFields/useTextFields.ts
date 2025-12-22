import { computed, ref } from 'vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'

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
  const { getCurrentView, getAdUnitNamesWithLockedTag, getAdUnitNamesWithVisibilityLockedTag } =
    useCanvasData()

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

  const getOverrideState = () => {
    switch (fieldName) {
      case 'headline':
        return tools.overrideStates.headlineOverride
      case 'subhead':
        return tools.overrideStates.subheadOverride
      case 'cta':
        return tools.overrideStates.ctaOverride
      case 'disclaimer':
        return tools.overrideStates.disclaimerOverride
      default:
        return ref(false)
    }
  }

  // Always return the same predictable shape
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

    // Text locks (always present)
    overrideState: getOverrideState(),
    lockedElements: computed(() => getAdUnitNamesWithLockedTag(fieldName)),

    // Visibility (always present - enabled based on config.hasVisibility)
    visibility: fieldName === 'disclaimer' ? tools.disclaimerVisibility : ref(false),
    visibilityOverrideState:
      fieldName === 'disclaimer' ? tools.overrideStates.disclaimerVisibilityOverride : ref(false),
    lockedVisibilityElements: computed(() => getAdUnitNamesWithVisibilityLockedTag(fieldName)),

    // Background visibility (always present - enabled based on config.hasBgVisibility)
    bgVisibility: fieldName === 'disclaimer' ? tools.disclaimerBGVisibility : ref(false),
    bgVisibilityOverrideState:
      fieldName === 'disclaimer' ? tools.overrideStates.disclaimerBGVisibilityOverride : ref(false),
    lockedBgElements: computed(() => getAdUnitNamesWithVisibilityLockedTag('disclaimerBG')),

    // Utility function
    getCustomMessage: (type: 'text' | 'visibility' | 'bgVisibility') => config.customMessages[type],
  }
}
