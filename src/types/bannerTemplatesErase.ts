/**
 * Banner templates - predefined at application startup
 * These are the master templates that get copied to working banners
 */

export interface BannerTemplate {
  id: string
  name: string
  description: string
  category: string
  dimensions: {
    width: number
    height: number
    unit: string
  }
  elements: Record<string, TemplateElement>
  metadata: {
    version: string
    created_date: string
    author: string
    tags: string[]
  }
}

export interface TemplateElement {
  id: string
  layer: string // Which layer this element belongs to
  tool?: string // Optional: Which tool manages this element (can be determined by tool registry)
  position: {
    center_x: number
    center_y: number
  }
  dimensions: {
    width: number
    height: number
  }
  locked_properties: string[] // Properties that cannot be modified
  editable_properties: string[] // Properties user can modify
  properties: Record<string, unknown>
  constraints?: {
    min_width?: number
    max_width?: number
    min_height?: number
    max_height?: number
    allowed_positions?: Array<{ x: number; y: number }>
    max_content_length?: number
  }
}

// Available banner templates
export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'Skyline-Desktop592x25',
    name: 'Skyline Desktop 592 x 25',
    description: 'Compact horizontal banner for desktop skyline placement',
    category: 'skyline',
    dimensions: {
      width: 592.15,
      height: 25,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 30, center_y: 12.5 },
        dimensions: { width: 40, height: 20 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 60,
          max_height: 22,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 430, center_y: 30 },
        dimensions: { width: 250, height: 20 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Short Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 12,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 30,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 450, center_y: 12.5 },
        dimensions: { width: 80, height: 20 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Learn More',
            font: {
              family: 'Arial, sans-serif',
              size: 10,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 3,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 12,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['skyline', 'compact', 'horizontal'],
    },
  },
  {
    id: 'SkylineV2-Desktop676x30',
    name: 'Skyline V2 Desktop',
    description: 'Updated skyline banner with slightly larger dimensions',
    category: 'skyline',
    dimensions: {
      width: 676.26,
      height: 30,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 35, center_y: 15 },
        dimensions: { width: 50, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 70,
          max_height: 28,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 250, center_y: 15 },
        dimensions: { width: 300, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Featured Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 35,
        },
      },
      cta_button: {
        id: 'cta-button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 430, center_y: 285 },
        dimensions: { width: 100, height: 24 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Click Here',
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 4,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 15,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['skyline', 'v2', 'enhanced'],
    },
  },
  {
    id: 'Marquee-Tablet449x95',
    name: 'Marquee Tablet',
    description: 'Tablet-optimized marquee banner',
    category: 'marquee',
    dimensions: {
      width: 449.15,
      height: 95,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 40, center_y: 47.5 },
        dimensions: { width: 60, height: 30 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 80,
          max_height: 40,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 200, center_y: 35 },
        dimensions: { width: 200, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Tablet Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 16,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 25,
        },
      },
      subhead: {
        id: 'subheading',
        layer: 'subheading',
        tool: 'Texts',
        position: { center_x: 430, center_y: 70 },
        dimensions: { width: 200, height: 20 },
        locked_properties: ['type', 'position', 'dimensions', 'font.family', 'font.size'],
        editable_properties: ['content', 'font.color'],
        properties: {
          content: 'Tablet subhead text',
          font: {
            family: 'Arial, sans-serif',
            size: 12,
            weight: 'normal',
            color: '#666666',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 40,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 350, center_y: 60 },
        dimensions: { width: 80, height: 28 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'CTA',
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 4,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 10,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['marquee', 'tablet', 'responsive'],
    },
  },
  {
    id: 'Marquee-Mobile210x69',
    name: 'Marquee Mobile',
    description: 'Mobile-optimized compact marquee banner',
    category: 'marquee',
    dimensions: {
      width: 209.82,
      height: 69,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 30, center_y: 34.5 },
        dimensions: { width: 40, height: 20 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 50,
          max_height: 25,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 120, center_y: 25 },
        dimensions: { width: 120, height: 20 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Mobile Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 12,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 20,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 120, center_y: 50 },
        dimensions: { width: 70, height: 22 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Tap Here',
            font: {
              family: 'Arial, sans-serif',
              size: 10,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 3,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 10,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['marquee', 'mobile', 'compact'],
    },
  },
  {
    id: 'Marquee-Logo53x69',
    name: 'Marquee Logo',
    description: 'Logo-only marquee banner',
    category: 'marquee',
    dimensions: {
      width: 53.08,
      height: 69,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 26.54, center_y: 34.5 },
        dimensions: { width: 40, height: 40 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 50,
          max_height: 50,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['marquee', 'logo-only', 'minimal'],
    },
  },
  {
    id: 'Brandbox-Desktop245x118',
    name: 'Brandbox Desktop',
    description: 'Vertical brandbox banner for desktop',
    category: 'brandbox',
    dimensions: {
      width: 245,
      height: 117.79,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 122.5, center_y: 30 },
        dimensions: { width: 60, height: 30 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 80,
          max_height: 40,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 122.5, center_y: 70 },
        dimensions: { width: 200, height: 25 },
        locked_properties: ['type', 'position', 'dimensions', 'font.alignment'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Brand Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold',
            color: '#333333',
            alignment: 'center',
          },
        },
        constraints: {
          max_content_length: 25,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 122.5, center_y: 100 },
        dimensions: { width: 100, height: 28 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Explore',
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 4,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 12,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['brandbox', 'vertical', 'desktop'],
    },
  },
  {
    id: 'Brandbox-Tablet200x115',
    name: 'Brandbox Tablet',
    description: 'Vertical brandbox banner for tablet',
    category: 'brandbox',
    dimensions: {
      width: 200,
      height: 114.86,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 100, center_y: 30 },
        dimensions: { width: 50, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 60,
          max_height: 30,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 100, center_y: 65 },
        dimensions: { width: 180, height: 25 },
        locked_properties: ['type', 'position', 'dimensions', 'font.alignment'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Brand Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 13,
            weight: 'bold',
            color: '#333333',
            alignment: 'center',
          },
        },
        constraints: {
          max_content_length: 22,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 100, center_y: 95 },
        dimensions: { width: 90, height: 26 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Learn More',
            font: {
              family: 'Arial, sans-serif',
              size: 11,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 4,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 12,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['brandbox', 'vertical', 'tablet'],
    },
  },
  {
    id: 'Brandbox-Logo50x50',
    name: 'Brandbox Logo',
    description: 'Logo-only brandbox banner',
    category: 'brandbox',
    dimensions: {
      width: 50,
      height: 50,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 25, center_y: 25 },
        dimensions: { width: 40, height: 40 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 45,
          max_height: 45,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['brandbox', 'logo-only', 'minimal'],
    },
  },
  {
    id: 'Marquee-Desktop860x95',
    name: 'Marquee Desktop',
    description: 'Desktop-optimized marquee banner with centered layout',
    category: 'marquee',
    dimensions: {
      width: 860,
      height: 95,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        layer: 'logo',
        tool: 'Logos',
        position: { center_x: 70, center_y: 47.5 },
        dimensions: { width: 80, height: 40 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 100,
          max_height: 50,
        },
      },
      headline: {
        id: 'headline',
        layer: 'headline',
        tool: 'Texts',
        position: { center_x: 250, center_y: 35 },
        dimensions: { width: 200, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Desktop Headline',
          font: {
            family: 'Arial, sans-serif',
            size: 18,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 40,
        },
      },
      subheading: {
        id: 'subheading',
        layer: 'subheading',
        tool: 'Texts',
        position: { center_x: 260, center_y: 60 },
        dimensions: { width: 220, height: 20 },
        locked_properties: ['type', 'position', 'dimensions', 'font.family', 'font.size'],
        editable_properties: ['content', 'font.color'],
        properties: {
          content: 'Supporting subheadline text',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'normal',
            color: '#666666',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 60,
        },
      },
      cta_button: {
        id: 'cta_button',
        layer: 'CTA',
        tool: 'Texts',
        position: { center_x: 250, center_y: 80 },
        dimensions: { width: 100, height: 28 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Learn More',
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#007bff',
            border_radius: 4,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#0056b3',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 12,
        },
      },
      image: {
        id: 'image',
        layer: 'lifestyleImage',
        tool: 'Images',
        position: { center_x: 670, center_y: 47.5 },
        dimensions: { width: 350, height: 85 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text', 'opacity'],
        properties: {
          source: 'placeholder-image.jpg',
          alt_text: 'Promotional Image',
          opacity: 1,
        },
        constraints: {
          max_width: 400,
          max_height: 90,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2025-10-14',
      author: 'Banner Editor',
      tags: ['marquee', 'desktop', 'wide', 'image-right'],
    },
  },
]

// Banner positioning configuration - controls where each banner appears on canvas
export const BANNER_TEMP_POSITION: Record<string, { x: number; y: number }> = {
  'Skyline-Desktop592x25': { x: 0, y: 0 },
  'Skyline-Logo': { x: 3087.5, y: 0 },
  'SkylineV2-Desktop676x30': { x: 0, y: 43.55 },
  'Marquee-Tablet449x95': { x: 0, y: 194.05 },
  'Marquee-Mobile210x69': { x: 2367, y: 194.05 },
  'Marquee-Logo53x69': { x: 3536.5, y: 194.05 },
  'Brandbox-Desktop245x118': { x: 0, y: 294.4 },
  'Brandbox-Tablet200x115': { x: 1314, y: 294.4 },
  'Brandbox-Logo50x50': { x: 2449, y: 294.4 },
  'Marquee-Desktop860x95': { x: 0, y: 95.95 },
}

// User can add these additional elements to any banner
export const ADDABLE_ELEMENTS = {
  shape: {
    layer: 'shape',
    default_properties: {
      shape_type: 'rectangle',
      fill_color: '#3498db',
      stroke_color: '#2c3e50',
      stroke_width: 2,
    },
    editable_properties: [
      'position',
      'dimensions',
      'fill_color',
      'stroke_color',
      'stroke_width',
      'shape_type',
    ],
  },
  extra_text: {
    layer: 'subheading',
    tool: 'Texts',
    default_properties: {
      content: 'New text',
      font: {
        family: 'Arial, sans-serif',
        size: 14,
        weight: 'normal',
        color: '#333333',
        alignment: 'left',
      },
    },
    editable_properties: ['content', 'position', 'dimensions', 'font'],
  },
  extra_image: {
    layer: 'lifestyleImage',
    default_properties: {
      source: 'placeholder.jpg',
      alt_text: 'Image',
      opacity: 1,
    },
    editable_properties: ['source', 'alt_text', 'opacity', 'position', 'dimensions'],
  },
}
