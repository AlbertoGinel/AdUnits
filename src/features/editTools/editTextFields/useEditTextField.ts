import { computed } from 'vue'
import { useFieldService } from '@/data/services/useFieldService'
import { useEditTools } from '@/features/editTools/useEditTools'
import { TEXT_ELEMENT_TYPES } from '@/types/mainTypes'
import type { TextElementType } from '@/types/mainTypes'

//It remenber the tittle of the textfields
export const TEXT_FIELD_CONFIGS: Record<string, string> = {
  headline: 'Main headline',
  subhead: 'Sub headline',
  cta: 'Button CTA',
  disclaimer: 'Disclaimer text',
} as const

export function useEditTextField() {
  const { getFieldValue, updateFieldValue } = useFieldService()
  const { availableItems } = useEditTools()

  // Filter available items to only text elements that exist in the current context (excluding disclaimer)
  const availableTextElements = computed(() => {
    return availableItems.value.filter(
      (item) => TEXT_ELEMENT_TYPES.includes(item as TextElementType) && item !== 'disclaimer',
    ) as TextElementType[]
  })

  // Check if disclaimer is available separately
  const hasDisclaimer = computed(() => {
    return availableItems.value.includes('disclaimer')
  })

  //Just names of the fields

  const getTextFieldConfig = (type: string): string | null => {
    return TEXT_FIELD_CONFIGS[type] || null
  }

  //v-model connection - fixed to use property-based services

  const getTextFieldValue = (type: TextElementType): string => {
    const value = getFieldValue(type, 'text')
    return value || ''
  }

  const setTextFieldValue = (type: TextElementType, value: string): void => {
    updateFieldValue(type, 'text', value)
  }

  //visibility connection - works for both disclaimer and disclaimerBG

  const getVisibilityValue = (elementKey: 'disclaimer' | 'disclaimerBG'): boolean => {
    const value = getFieldValue(elementKey, 'visibility')
    return value ?? true
  }

  const setVisibilityValue = (elementKey: 'disclaimer' | 'disclaimerBG', value: boolean): void => {
    updateFieldValue(elementKey, 'visibility', value)
  }

  return {
    availableTextElements,
    hasDisclaimer,
    getTextFieldConfig,
    getTextFieldValue,
    setTextFieldValue,
    getVisibilityValue,
    setVisibilityValue,
  }
}
