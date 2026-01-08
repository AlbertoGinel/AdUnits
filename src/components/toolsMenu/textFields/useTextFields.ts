import { computed, ref } from 'vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'
import { useOverrideLogic } from '@/components/toolsMenu/shared/useOverrideLogic'

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
  const { executeOverride } = useOverrideLogic()

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

  // Override functionality - uses shared logic
  const overrideAllLocked = () => {
    const currentValue = getFieldValue().value
    if (!currentValue) return

    // Use shared override logic
    executeOverride(fieldName, currentValue, fieldName === 'image' ? 'image' : 'text')
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
    getCustomMessage: (type: 'text' | 'visibility' | 'bgVisibility' | 'asset') => {
      // Text fields only use text/visibility/bgVisibility, but interface requires asset support
      if (type === 'asset') return 'Asset does not apply on:' // Fallback for compatibility
      return config.customMessages[type as keyof typeof config.customMessages]
    },
  }
}
