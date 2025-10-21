// Color enums
export enum TextColor {
  GRAY = 'gray',
  WHITE = 'white',
}

// Regex for valid hex color
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export interface BaseImage {
  assetId: string
  crop?: CropSettings
}

type CropSettings =
  | { focal: { x: number; y: number } }
  | { rectangular: { x: number; y: number; w: number; h: number } }

// Platform-specific image types with literal names
interface DesktopImage extends BaseImage {
  name: 'desktopImage'
}

interface DesktopLogo extends BaseImage {
  name: 'desktopLogo'
}

interface MobileImage extends BaseImage {
  name: 'mobileImage'
}

interface MobileLogo extends BaseImage {
  name: 'mobileLogo'
}

// Image arrays that enforce exactly one image and one logo
type DesktopImages = [DesktopImage, DesktopLogo]
type MobileImages = [MobileImage, MobileLogo]

// AdUnit interface with proper constraints
export interface AdUnit {
  headline: string // 25 chars
  subhead: string // 30 chars, must end with .!?*
  cta: string // 16 chars, sentence case
  imageAltText: string // 150 chars
  logoAltText: string // 150 chars
  legalDisclaimerText?: string // 600 chars
  legalDisclaimerLabel?: string // 12 chars
  legalDisclaimerPopUpCopy?: string // 600 chars
  variantId: string // fixed "436"
  backgroundColorHex?: string // Only for Skyline v3
  textColor?: TextColor // Only for Skyline v3
}

// Platform-specific AdUnits with correct image types
export interface DesktopAdUnit extends AdUnit {
  images: DesktopImages
}

export interface MobileAdUnit extends AdUnit {
  images: MobileImages
}

// Creative interface with required and optional adUnits
export interface Creative {
  advertiserId: number
  metadata: {
    name: string
    folderId?: string
    templateId: string
  }
  adUnits: {
    // Required adUnits (8)
    marqueeDesktop: DesktopAdUnit
    marqueeApp: MobileAdUnit
    skylineDesktop: DesktopAdUnit
    skylineApp: MobileAdUnit
    brandboxDesktop: DesktopAdUnit
    brandboxApp: MobileAdUnit
    galleryDesktop: DesktopAdUnit
    galleryApp: MobileAdUnit

    // Optional variants
    skylineDesktopV2?: DesktopAdUnit
    skylineAppV2?: MobileAdUnit
    skylineDesktopV3?: DesktopAdUnit
    skylineAppV3?: MobileAdUnit
  }
}
