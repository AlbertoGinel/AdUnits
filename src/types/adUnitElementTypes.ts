import type { ElementType } from './mainTypes'

// Common base properties for ALL elements
type BaseProperties = {
  id: ElementType
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
  visibilityLocked: boolean
}

// Properties for RECT elements
type RectProperties = {
  locked: boolean
  fill: string
  cornerRadius: number
  strokeColor: string
  strokeWidth: number
}

type GradientRectProperties = {
  // Gradient properties
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
  [key in 'background' | 'cta-background']: BaseProperties & DimensionProperties & RectProperties
} & {
  // DisclaimerBG (RECT element with visibility)
  disclaimerBG: BaseProperties &
    DimensionProperties &
    RectProperties &
    GradientRectProperties &
    EditableProperties & {
      visibility: boolean
    }
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
