// Complete interfaces with all properties - exported for store usage
export interface Position {
  x: number
  y: number
}

export interface Dimensions {
  width: number
  height: number
}

export interface TextStyle {
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  fontWeight?: number
}

// Import BaseImage from creativeTypes
import { type BaseImage } from './creativeTypes'

export interface ImageAsset extends BaseImage {
  position: Position
  name: string
  assetId: string
}

export interface AdUnit {
  name: string
  dimensions: Dimensions
  position: Position
  headline: TextStyle
  subhead: TextStyle
  cta: TextStyle
  legalDisclaimerText: TextStyle
  imageAltText: string
  logoAltText: string
  variantId: string
  rollBackPos: Position
  rollScale: number
  images: ImageAsset[]
}

// AdUnit key types for type safety
export type AdUnitKey =
  | 'marqueeDesktop'
  | 'marqueeApp'
  | 'skylineDesktop'
  | 'skylineApp'
  | 'brandboxDesktop'
  | 'brandboxApp'
  | 'galleryDesktop'
  | 'galleryApp'
  | 'skylineDesktopV2'
  | 'skylineAppV2'
  | 'skylineDesktopV3'
  | 'skylineAppV3'

export interface CreativeFrames {
  advertiserId: number
  metadata: {
    name: string
    folderId: string
    templateId: string
  }
  framePadding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  AdUnitTitle: {
    fontSize: number
    fontFamily: string
    fill: string
  }
  adUnits: {
    marqueeDesktop: AdUnit
    marqueeApp: AdUnit
    skylineDesktop: AdUnit
    skylineApp: AdUnit
    brandboxDesktop: AdUnit
    brandboxApp: AdUnit
    galleryDesktop: AdUnit
    galleryApp: AdUnit
    skylineDesktopV2?: AdUnit
    skylineAppV2?: AdUnit
    skylineDesktopV3?: AdUnit
    skylineAppV3?: AdUnit
  }
}

// Complete CREATIVE_FRAMES implementation with all properties
export const CREATIVE_FRAMES: CreativeFrames = {
  advertiserId: 12345,
  metadata: {
    name: 'Summer Campaign 2024',
    folderId: 'campaigns-2024',
    templateId: 'frames-template-v1',
  },
  framePadding: {
    top: 10, // Space for header with name and edit button
    right: 10,
    bottom: 10,
    left: 10,
  },
  AdUnitTitle: {
    fontSize: 20,
    fontFamily: 'Arial',
    fill: '#000000',
  },
  adUnits: {
    marqueeDesktop: {
      name: 'Marquee Desktop: 728x90px',
      dimensions: { width: 728, height: 90 },
      position: { x: 0, y: 31 },
      headline: {
        text: 'Headline goes here',
        x: 103,
        y: 14,
        fontSize: 14,
        fontFamily: 'sans-serif',
        fill: '#000080',
        fontWeight: 100,
      },
      subhead: {
        text: 'Subhead goes here',
        x: 103,
        y: 31,
        fontSize: 9,
        fontFamily: 'sans-serif',
        fill: '#000080',
        fontWeight: 100,
      },
      cta: {
        text: 'CTA button',
        x: 114,
        y: 67,
        fontSize: 9,
        fontFamily: 'sans-serif',
        fill: '#00d4aa',
        fontWeight: 100,
      },
      legalDisclaimerText: {
        text: 'Legal disclaimer Legal disclaimer Legal disclaimer Legal disclaimer Legal disclaimer Legal discl',
        x: 387,
        y: 79,
        fontSize: 8,
        fontFamily: 'sans-serif',
        fill: '#fabada',
        fontWeight: 100,
      },

      imageAltText: 'Desktop marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for desktop',
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 364, y: 0 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440001',
          crop: {
            rectangular: {
              x: 0,
              y: 0,
              w: 364,
              h: 90,
            },
          },
        },
        {
          position: { x: 0, y: 0 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440002',
          crop: {
            rectangular: {
              x: 0,
              y: 0,
              w: 90,
              h: 90,
            },
          },
        },
      ],
    },
    marqueeApp: {
      name: 'Marquee App: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 320, y: 995 },
      headline: {
        text: 'Summer Collection 2024',
        x: 20,
        y: 40,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 100,
      },
      subhead: {
        text: 'Discover our new arrivals!',
        x: 20,
        y: 65,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 100,
      },
      cta: {
        text: 'Shop now',
        x: 200,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
        fontWeight: 400,
      },
      legalDisclaimerText: {
        text: 'Limited time offer. Terms apply.',
        x: 20,
        y: 230,
        fontSize: 8,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 150, y: 120 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440003',
        },
        {
          position: { x: 20, y: 20 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440004',
        },
      ],
      imageAltText: 'Desktop marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for desktop',
    },
    skylineDesktop: {
      name: 'Skyline Desktop: 300x600px',
      dimensions: { width: 300, height: 600 },
      position: { x: 0, y: 333 },
      headline: {
        text: 'Premium Quality',
        x: 40,
        y: 100,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 400,
      },
      subhead: {
        text: 'Experience the difference today!',
        x: 40,
        y: 140,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      cta: {
        text: 'Learn more',
        x: 40,
        y: 500,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
        fontWeight: 400,
      },
      legalDisclaimerText: {
        text: 'Results may vary by individual.',
        x: 40,
        y: 570,
        fontSize: 8,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 40, y: 200 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440005',
        },
        {
          position: { x: 40, y: 40 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440006',
        },
      ],
      imageAltText: 'Desktop marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for desktop',
    },
    skylineApp: {
      name: 'Skyline App: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 641, y: 995 },
      headline: {
        text: 'Premium Quality',
        x: 20,
        y: 50,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 400,
      },
      subhead: {
        text: 'Experience the difference!',
        x: 20,
        y: 80,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      cta: {
        text: 'Learn more',
        x: 20,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
        fontWeight: 400,
      },
      legalDisclaimerText: {
        text: 'Results may vary by individual.',
        x: 20,
        y: 220,
        fontSize: 8,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 150, y: 120 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440007',
        },
        {
          position: { x: 20, y: 20 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440008',
        },
      ],
      imageAltText: 'Desktop marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for desktop',
    },
    brandboxDesktop: {
      name: 'Brandbox Desktop: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 0, y: 993 },
      headline: {
        text: 'Brand Stories',
        x: 80,
        y: 60,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 400,
      },
      subhead: {
        text: 'Explore our heritage!',
        x: 80,
        y: 90,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      cta: {
        text: 'Read story',
        x: 80,
        y: 180,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
        fontWeight: 400,
      },
      legalDisclaimerText: {
        text: 'Founded in 1975 with quality values.',
        x: 80,
        y: 220,
        fontSize: 8,
        fontFamily: 'Arial',
        fill: '#666666',
        fontWeight: 300,
      },
      imageAltText: 'Desktop brandbox showing company heritage',
      logoAltText: 'Heritage brand logo for desktop',
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 20, y: 60 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440009',
        },
        {
          position: { x: 220, y: 200 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440010',
        },
      ],
    },
    brandboxApp: {
      name: 'Brandbox App: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 641, y: 1305 },
      headline: {
        text: 'Brand Stories',
        x: 100,
        y: 50,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Explore our heritage!',
        x: 100,
        y: 80,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Mobile brandbox showing company values',
      logoAltText: 'Heritage brand logo for mobile',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 20, y: 50 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440011',
        },
        {
          position: { x: 250, y: 220 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440012',
        },
      ],
    },
    galleryDesktop: {
      name: 'Gallery Desktop: 728x90px',
      dimensions: { width: 728, height: 90 },
      position: { x: 0, y: 181 },
      headline: {
        text: 'Product Gallery',
        x: 120,
        y: 25,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Browse our collection!',
        x: 120,
        y: 50,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'View gallery',
        x: 600,
        y: 35,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Desktop gallery with multiple product categories',
      logoAltText: 'Gallery brand logo for desktop',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 10, y: 10 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440013',
        },
        {
          position: { x: 650, y: 60 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440014',
        },
      ],
    },
    galleryApp: {
      name: 'Gallery App: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 321, y: 1305 },
      headline: {
        text: 'Mobile Gallery',
        x: 50,
        y: 50,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Swipe to explore more!',
        x: 0,
        y: 43.55,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      cta: {
        text: 'Start swiping',
        x: 0,
        y: 43.55,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      imageAltText: 'Touch-friendly gallery of product images and videos',
      logoAltText: 'Gallery icon for mobile app',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 43.55 },
      rollScale: 1,
      images: [
        {
          position: { x: 0, y: 43.55 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440015',
        },
        {
          position: { x: 0, y: 43.55 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440016',
        },
      ],
    },
    skylineDesktopV2: {
      name: 'Skyline Desktop V2: 300x600px',
      dimensions: { width: 300, height: 600 },
      position: { x: 642, y: 333 },
      headline: {
        text: 'Enhanced Experience',
        x: 40,
        y: 100,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'New features available!',
        x: 40,
        y: 140,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Try it free',
        x: 40,
        y: 500,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Desktop skyline v2 with enhanced features',
      logoAltText: 'Updated brand logo version 2',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 40, y: 200 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440017',
        },
        {
          position: { x: 40, y: 40 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440018',
        },
      ],
    },
    skylineAppV2: {
      name: 'Skyline App V2: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 0, y: 1307 },
      headline: {
        text: 'Enhanced Experience',
        x: 20,
        y: 50,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'New features available!',
        x: 20,
        y: 80,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Try it free',
        x: 20,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Mobile skyline v2 with enhanced features',
      logoAltText: 'Updated mobile logo version 2',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 150, y: 120 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440019',
        },
        {
          position: { x: 20, y: 20 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440020',
        },
      ],
    },

    skylineDesktopV3: {
      name: 'Skyline Desktop V3: 300x600px',
      dimensions: { width: 300, height: 600 },
      position: { x: 320, y: 333 },
      headline: {
        text: 'Modern Design',
        x: 40,
        y: 100,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      subhead: {
        text: 'Fresh new look!',
        x: 40,
        y: 140,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#CCCCCC',
      },
      cta: {
        text: 'Explore now',
        x: 40,
        y: 500,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Modern desktop skyline with dark theme',
      logoAltText: 'Modern brand logo version 3',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 40, y: 200 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440021',
        },
        {
          position: { x: 40, y: 40 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440022',
        },
      ],
    },
    skylineAppV3: {
      name: 'Skyline App V3: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 751, y: 21 },
      headline: {
        text: 'Modern Design',
        x: 20,
        y: 50,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      subhead: {
        text: 'Fresh new look!',
        x: 20,
        y: 80,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#CCCCCC',
      },
      cta: {
        text: 'Explore now',
        x: 20,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Modern mobile skyline with dark theme',
      logoAltText: 'Modern mobile logo version 3',
      legalDisclaimerText: {
        text: 'Read story',
        x: 100,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 150, y: 120 },
          name: 'mobileImage',
          assetId: '550e8400-e29b-41d4-a716-446655440023',
        },
        {
          position: { x: 20, y: 20 },
          name: 'mobileLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440024',
        },
      ],
    },
  },
}
