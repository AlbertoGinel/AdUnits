import type { AdUnitElementMap, AdUnit } from './adUnitElementTypes'

/**
 * Frame Model Types
 * Defines the structure/layout templates from framesModel.json
 * These are PARTIAL elements - only layout properties, no content
 */

// Omit content properties that come from CreativeContentData
type ContentProperties = 'imageID' | 'cropData' | 'text' | 'locked' | 'visibility'

// Frame model elements = Partial layout (JSON may have incomplete properties)
// Omit content properties, then make all remaining properties optional
export type FrameModelBackground = Partial<Omit<AdUnitElementMap['background'], ContentProperties>>
export type FrameModelImage = Partial<Omit<AdUnitElementMap['image'], ContentProperties>>
export type FrameModelLogo = Partial<Omit<AdUnitElementMap['logo'], ContentProperties>>
export type FrameModelHeadline = Partial<Omit<AdUnitElementMap['headline'], ContentProperties>>
export type FrameModelSubhead = Partial<Omit<AdUnitElementMap['subhead'], ContentProperties>>
export type FrameModelDisclaimer = Partial<Omit<AdUnitElementMap['disclaimer'], ContentProperties>>
export type FrameModelDisclaimerBG = Partial<
  Omit<AdUnitElementMap['disclaimerBG'], ContentProperties>
>
export type FrameModelCTA = Partial<Omit<AdUnitElementMap['cta'], ContentProperties>>
export type FrameModelCTABackground = Partial<
  Omit<AdUnitElementMap['cta-background'], ContentProperties>
>

// Union of all frame model element types
export type FrameModelElement =
  | FrameModelBackground
  | FrameModelImage
  | FrameModelLogo
  | FrameModelHeadline
  | FrameModelSubhead
  | FrameModelDisclaimer
  | FrameModelDisclaimerBG
  | FrameModelCTA
  | FrameModelCTABackground

export type FrameConfig = AdUnit['frameConfig']

// Frame model ad unit structure
export interface FrameModelAdUnit {
  id: string
  title: string
  frameConfig: FrameConfig
  elements: Record<string, FrameModelElement>
}

// Stage configuration
export interface StageConfig {
  width: number
  height: number
}

// Complete frame model structure (what framesModel.json contains)
export interface FrameModel {
  stage: StageConfig
  adUnits: Record<string, FrameModelAdUnit>
}
