// types/creative.ts
/**
 * TypeScript interfaces for creative data structure
 * Based on serverCreatives.json format
 * Derived from internal types using utility types - DB/API subset of runtime types
 */

import type { AdUnitElementMap } from './adUnitElementTypes'
import type { LayerObjectMap } from './LayerTypes'

// Derive DB element types from AdUnitElementMap - only persistable properties

// Text elements - only text and locked
export type TextElement = Pick<AdUnitElementMap['headline'], 'text' | 'locked'>

// Disclaimer - text, visibility, and both locks
export type DisclaimerElement = Pick<
  AdUnitElementMap['disclaimer'],
  'text' | 'locked' | 'visibility' | 'visibilityLocked'
>

// Logo - imageID and locked
export type LogoElement = Pick<AdUnitElementMap['logo'], 'imageID' | 'locked'>

// Image - imageID, crop, and locked
export type ImageElement = Pick<AdUnitElementMap['image'], 'imageID' | 'locked' | 'cropData'>

// DisclaimerBG - only visibility and locked
export type DisclaimerBGElement = Pick<AdUnitElementMap['disclaimerBG'], 'visibility' | 'locked'>

// Layer data - use LayerObjectMap directly (no reduction needed)
export type LayerData = LayerObjectMap[keyof LayerObjectMap]

// AdUnit elements for DB - each element is optional since not all adUnits have all elements
export type AdUnitElements = Partial<{
  headline: TextElement
  subhead: TextElement
  cta: TextElement
  disclaimer: DisclaimerElement
  logo: LogoElement
  image: ImageElement
  disclaimerBG: DisclaimerBGElement
}>

// AdUnit data - only id and elements (no frameConfig, positioning, or styling)
export type AdUnitData = {
  id: string
  elements: AdUnitElements
}

// Image metadata for DB
export interface ImageMetadata {
  imageId: string
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
