// types/creative.ts
/**
 * TypeScript interfaces for creative data structure
 * Based on serverCreatives.json format
 */

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageElement {
  image: string
  crop?: CropData
  locked: boolean
}

export interface LogoElement {
  image: string
  locked: boolean
}

export interface TextElement {
  text: string
  locked: boolean
}

export interface AdUnitElements {
  image?: ImageElement
  logo?: LogoElement
  headline?: TextElement
  subhead?: TextElement
  cta?: TextElement
  background?: ImageElement
}

export interface AdUnitData {
  elements: AdUnitElements
}

export interface LayerData {
  type: 'text' | 'image' | 'rect'
  defaultValue: string
  visibility?: boolean
  darkColour?: string
  lightColour?: string
}

export interface ImageMetadata {
  id: string
  type: 'image' | 'logo'
  name: string
  altText: string
}

export interface CreativeContentData {
  creative_id: string
  adUnits: Record<string, AdUnitData>
  layers: Record<string, LayerData>
  images: ImageMetadata[]
}

export interface ServerAssetsModule {
  default: {
    status: number
    content: Array<{
      id: string
      type: string
      creative_id: string
      path: string
      error: string
    }>
  }
}
