import type { EditableElementType, ImageElementType } from './mainTypes'

// Layer property mapping - each element maps to an object with typed properties
export type LayerObjectMap = {
  [key in 'headline' | 'subhead' | 'cta']: {
    id: EditableElementType
    text: string
    locked: boolean
  }
} & {
  disclaimer: {
    id: 'disclaimer'
    text: string
    visibility: boolean
    locked: boolean
    visibilityLocked: boolean
  }
} & {
  disclaimerBG: {
    id: 'disclaimerBG'
    visibility: boolean
    locked: boolean
  }
} & {
  [key in ImageElementType]: {
    id: ImageElementType
    imageID: string
    locked: boolean
  }
}

// Layer type - gets the correct object based on element type
export type Layer<T extends EditableElementType = EditableElementType> = LayerObjectMap[T]

// Layer store record
export type LayersRecord = {
  [K in EditableElementType]: LayerObjectMap[K]
}
