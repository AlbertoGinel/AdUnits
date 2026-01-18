const ELEMENT_TYPES = {
  ALL: [
    'background',
    'cta-background',
    'headline',
    'logo',
    'subhead',
    'cta',
    'image',
    'disclaimer',
    'disclaimerBG',
  ] as const,
  TEXT: ['headline', 'subhead', 'cta', 'disclaimer'] as const,
  RECT: ['background', 'disclaimerBG', 'cta-background'] as const,
  IMAGE: ['logo', 'image'] as const,
  EDITABLE: ['headline', 'logo', 'subhead', 'cta', 'image', 'disclaimer', 'disclaimerBG'] as const,
} as const

// Derive types from the const arrays
export type ElementType = (typeof ELEMENT_TYPES.ALL)[number]
export type TextElementType = (typeof ELEMENT_TYPES.TEXT)[number]
export type ImageElementType = (typeof ELEMENT_TYPES.IMAGE)[number]
export type RectElementType = (typeof ELEMENT_TYPES.RECT)[number]
export type EditableElementType = (typeof ELEMENT_TYPES.EDITABLE)[number]

// Derive EditableElementType by excluding non-editable elements
export type NonEditableElementType = Exclude<ElementType, EditableElementType>

// Export constant arrays for iteration
export const TEXT_ELEMENT_TYPES = ELEMENT_TYPES.TEXT
export const IMAGE_ELEMENT_TYPES = ELEMENT_TYPES.IMAGE
export const RECT_ELEMENT_TYPES = ELEMENT_TYPES.RECT
export const EDITABLE_ELEMENT_TYPES = ELEMENT_TYPES.TEXT

// Core image and app types
export interface ImageAsset {
  imageID: string
  url: string
  type: ImageElementType
  name: string
  altText: string
}

export type ImageState = {
  images: Record<string, ImageAsset>
  uploadTemp: ImageAsset | null
}

export interface StageDimensions {
  width: number
  height: number
}

export type ViewMode = 'bulkMode' | 'focusMode'

export interface AppState {
  stage: StageDimensions
  currentView: ViewMode
  currentAdUnitId: string | null
  creativeId: string | null
  isInitialized: boolean
}

// Editable property names for any element type (works for both Elements and Layers)
export type EditablePropertiesOf<T extends EditableElementType> = T extends
  | 'headline'
  | 'subhead'
  | 'cta'
  ? 'text' | 'locked'
  : T extends 'disclaimer'
    ? 'text' | 'visibility' | 'locked' | 'visibilityLock'
    : T extends 'logo'
      ? 'imageID' | 'locked'
      : T extends 'image'
        ? 'imageID' | 'locked' | 'cropData'
        : T extends 'disclaimerBG'
          ? 'visibility' | 'visibilityLock'
          : never
