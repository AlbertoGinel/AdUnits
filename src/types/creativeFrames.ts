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
}

export interface ImageAsset {
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
  imageAltText: string
  logoAltText: string
  legalDisclaimerText: string
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
    top: 0, // Space for header with name and edit button
    right: 0,
    bottom: 0,
    left: 0,
  },
  adUnits: {
    marqueeDesktop: {
      name: 'Marquee Desktop: 728x90px',
      dimensions: { width: 728, height: 90 },
      position: { x: 100, y: 100 },
      headline: {
        text: 'Summer Collection 2024',
        x: 120,
        y: 25,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Discover our new arrivals!',
        x: 120,
        y: 50,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Shop now',
        x: 600,
        y: 35,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Desktop marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for desktop',
      legalDisclaimerText: 'Limited time offer. Terms and conditions apply.',
      variantId: '436',
      rollBackPos: { x: 0, y: 0 },
      rollScale: 1,
      images: [
        {
          position: { x: 10, y: 10 },
          name: 'desktopImage',
          assetId: '550e8400-e29b-41d4-a716-446655440001',
        },
        {
          position: { x: 650, y: 60 },
          name: 'desktopLogo',
          assetId: '550e8400-e29b-41d4-a716-446655440002',
        },
      ],
    },
    marqueeApp: {
      name: 'Marquee Mobile: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 100, y: 290 },
      headline: {
        text: 'Summer Collection 2024',
        x: 20,
        y: 40,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Discover our new arrivals!',
        x: 20,
        y: 65,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Shop now',
        x: 200,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Mobile marquee showcasing summer fashion collection',
      logoAltText: 'Brand logo for mobile',
      legalDisclaimerText: 'Limited time offer. Terms apply.',
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
    },
    skylineDesktop: {
      name: 'Skyline Desktop: 300x600px',
      dimensions: { width: 300, height: 600 },
      position: { x: 928, y: 100 },
      headline: {
        text: 'Premium Quality',
        x: 40,
        y: 100,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Experience the difference today!',
        x: 40,
        y: 140,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Learn more',
        x: 40,
        y: 500,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Desktop skyline showcasing premium product features',
      logoAltText: 'Premium brand logo for desktop',
      legalDisclaimerText: 'Results may vary by individual.',
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
    },
    skylineApp: {
      name: 'Skyline Mobile: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 500, y: 290 },
      headline: {
        text: 'Premium Quality',
        x: 20,
        y: 50,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Experience the difference!',
        x: 20,
        y: 80,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Learn more',
        x: 20,
        y: 200,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Mobile skyline showcasing premium product',
      logoAltText: 'Premium brand logo for mobile',
      legalDisclaimerText: 'Results may vary by individual.',
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
    },
    brandboxDesktop: {
      name: 'Brandbox Desktop: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 928, y: 800 },
      headline: {
        text: 'Brand Stories',
        x: 80,
        y: 60,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
      },
      subhead: {
        text: 'Explore our heritage!',
        x: 80,
        y: 90,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#666666',
      },
      cta: {
        text: 'Read story',
        x: 80,
        y: 180,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#FFFFFF',
      },
      imageAltText: 'Desktop brandbox showing company heritage',
      logoAltText: 'Heritage brand logo for desktop',
      legalDisclaimerText: 'Founded in 1975 with quality values.',
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
      name: 'Brandbox Mobile: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 100, y: 640 },
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
      legalDisclaimerText: 'Founded in 1975 with quality.',
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
      position: { x: 100, y: 990 },
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
      legalDisclaimerText: 'Products may vary by location.',
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
      name: 'Gallery Mobile: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 500, y: 640 },
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
      legalDisclaimerText: 'Swipe left or right to navigate.',
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
      position: { x: 1328, y: 100 },
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
      legalDisclaimerText: 'Free trial limited to 30 days.',
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
    /*
    skylineAppV2: {
      name: 'Skyline App V2: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 1328, y: 750 },
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
      legalDisclaimerText: 'Free trial limited to 30 days.',
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
    */
    skylineDesktopV3: {
      name: 'Skyline Desktop V3: 300x600px',
      dimensions: { width: 300, height: 600 },
      position: { x: 1328, y: 800 },
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
      legalDisclaimerText: 'Available in select markets.',
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
    /*
    skylineAppV3: {
      name: 'Skyline App V3: 300x250px',
      dimensions: { width: 300, height: 250 },
      position: { x: 1328, y: 1100 },
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
      legalDisclaimerText: 'Available in select markets.',
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
    */
  },
}
