import type { ElementType, EditableElementType, EditablePropertiesOf } from './mainTypes'

/**
 * Element Heritage Mapping
 * Single source of truth for element categories
 * Documents which base type each element extends
 */
export const ELEMENT_HERITAGE = {
  // Text elements
  headline: 'text',
  subhead: 'text',
  cta: 'text',
  disclaimer: 'text', // Text element with visibility

  // Rect elements
  background: 'rect',
  'cta-background': 'rect',
  disclaimerBG: 'rect', // Rect element with visibility

  // Image elements
  image: 'image',
  logo: 'image',
} as const satisfies Record<ElementType, 'text' | 'rect' | 'image'>

export type ElementCategory = (typeof ELEMENT_HERITAGE)[ElementType]

// Common base properties for ALL elements
type BaseProperties = {
  type: ElementType
  x: number
  y: number
}

// Properties for non-TEXT elements
type DimensionProperties = {
  width: number
  height: number
}

// Properties for TEXT elements
type TextProperties = {
  text: string
  fontSize: number
  fill: string
  fontFamily: string
  fontStyle: string
  align: 'left' | 'center' | 'right' | 'justify'
  wrap: 'word' | 'char' | 'none'
  verticalAlign: 'top' | 'middle' | 'bottom'
}

// Properties for IMAGE elements
type ImageProperties = {
  imageID: string
}

// Properties for 'image' element specifically (main image with crop)
type CropData = {
  x: number
  y: number
  width: number
  height: number
}

type ImageWithCropProperties = {
  cropData?: CropData
}

// Properties for EDITABLE elements
type EditableProperties = {
  locked: boolean
}

// Special properties for disclaimer
type DisclaimerProperties = {
  visibility: boolean
  visibilityLock: boolean
}

// Properties for RECT elements
type RectProperties = {
  cornerRadius: number
  strokeColor: string
  strokeWidth: number
}

// Solid fill variant
type SolidFillProperties = {
  fill: string
}

// Gradient fill variant
type GradientFillProperties = {
  fillLinearGradientStartPoint: {
    x: number
    y: number
  }
  fillLinearGradientEndPoint: {
    x: number
    y: number
  }
  fillLinearGradientColorStops: (string | number)[]
}

// Explicit mapped types combined via intersection
export type AdUnitElementMap = {
  // TEXT elements (headline, subhead, cta)
  [key in 'headline' | 'subhead' | 'cta']: BaseProperties &
    DimensionProperties &
    TextProperties &
    EditableProperties
} & {
  // Disclaimer (TEXT element with visibility)
  disclaimer: BaseProperties &
    DimensionProperties &
    TextProperties &
    EditableProperties &
    DisclaimerProperties
} & {
  // Non-editable RECT elements (background, cta-background)
  [key in 'background' | 'cta-background']: BaseProperties &
    DimensionProperties &
    RectProperties &
    SolidFillProperties
} & {
  // DisclaimerBG (RECT element with visibility - can have solid OR gradient fill)
  disclaimerBG: BaseProperties &
    DimensionProperties &
    RectProperties &
    (SolidFillProperties | GradientFillProperties) &
    EditableProperties &
    DisclaimerProperties
} & {
  // Logo (IMAGE element without crop)
  logo: BaseProperties & DimensionProperties & ImageProperties & EditableProperties
} & {
  // Image (IMAGE element with crop)
  image: BaseProperties &
    DimensionProperties &
    ImageProperties &
    EditableProperties &
    ImageWithCropProperties
}

// Union type of all element values
export type AdUnitElement = AdUnitElementMap[keyof AdUnitElementMap]

// Get element type for a specific key
export type ElementOf<K extends keyof AdUnitElementMap> = AdUnitElementMap[K]

export interface AdUnit {
  id: string
  frameConfig: {
    title: string
    dimensions: {
      width: number
      height: number
    }
    position: {
      x: number
      y: number
    }
    editButtonOffset?: {
      x: number
      y: number
    }
    contentOffset: {
      x: number
      y: number
    }
  }
  elements: Record<string, AdUnitElement>
}

// Service-relevant property keys (only the editable/observable ones)
export type EditablePropertyKeys =
  | 'text'
  | 'imageID'
  | 'visibility'
  | 'locked'
  | 'visibilityLock'
  | 'cropData'

// Get the value type for a specific property on a specific element
// This looks up the actual type from the element's structure
// What type is 'text' on headline?
// What type is 'visibilityLock' on disclaimer?
export type ElementPropertyValueType<
  T extends EditableElementType,
  P extends EditablePropertiesOf<T>,
> = AdUnitElementMap[T][P & keyof AdUnitElementMap[T]]

//guards

// Type guards for runtime type checking using heritage mapping

/**
 * Check if element is a TEXT element
 * Includes: headline, subhead, cta, disclaimer
 */
export function isTextElement(
  element: AdUnitElement,
): element is
  | AdUnitElementMap['headline']
  | AdUnitElementMap['subhead']
  | AdUnitElementMap['cta']
  | AdUnitElementMap['disclaimer'] {
  return ELEMENT_HERITAGE[element.type] === 'text'
}

/**
 * Check if element is specifically a disclaimer (text with special properties)
 */
export function isDisclaimerElement(
  element: AdUnitElement,
): element is AdUnitElementMap['disclaimer'] {
  return element.type === 'disclaimer'
}

/**
 * Check if element is an IMAGE element
 * Includes: image, logo
 */
export function isImageElement(
  element: AdUnitElement,
): element is AdUnitElementMap['logo'] | AdUnitElementMap['image'] {
  return ELEMENT_HERITAGE[element.type] === 'image'
}

/**
 * Check if element is a RECT element
 * Includes: background, cta-background, disclaimerBG
 */
export function isRectElement(
  element: AdUnitElement,
): element is Extract<AdUnitElement, RectProperties> {
  return ELEMENT_HERITAGE[element.type] === 'rect'
}

/**
 * Check if element has visibility property
 * Includes: disclaimer, disclaimerBG
 */
export function hasVisibility(
  element: AdUnitElement,
): element is AdUnitElementMap['disclaimer'] | AdUnitElementMap['disclaimerBG'] {
  return 'visibility' in element
}

/**
 * Check if element has crop data
 * Only: image (main image element)
 */
export function hasCrop(element: AdUnitElement): element is AdUnitElementMap['image'] {
  return 'cropData' in element
}

/**
 * Property-to-Lock Field Mapping
 * Maps editable properties to their corresponding lock fields
 */
export const lockFieldMap = {
  text: 'locked',
  imageID: 'locked',
  cropData: 'locked',
  visibility: 'visibilityLock',
} as const

export type LockFieldMap = typeof lockFieldMap
export type GetLockField<P extends keyof LockFieldMap> = LockFieldMap[P]
