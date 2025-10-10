// Banner templates - predefined at application startup
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
  type: 'text' | 'image' | 'button' | 'shape' | 'logo'
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
    id: 'header-banner-860x95',
    name: 'Header Banner',
    description: 'Standard header banner with logo, headline, subhead and CTA buttons',
    category: 'header',
    dimensions: {
      width: 860,
      height: 95,
      unit: 'px',
    },
    elements: {
      logo: {
        id: 'logo',
        type: 'logo',
        position: { center_x: 60, center_y: 47.5 },
        dimensions: { width: 80, height: 40 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text'],
        properties: {
          source: 'placeholder-logo.png',
          alt_text: 'Company Logo',
        },
        constraints: {
          max_width: 120,
          max_height: 60,
        },
      },
      headline: {
        id: 'headline',
        type: 'text',
        position: { center_x: 350, center_y: 30 },
        dimensions: { width: 300, height: 25 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['content', 'font.color', 'font.weight'],
        properties: {
          content: 'Headline goes here',
          font: {
            family: 'Arial, sans-serif',
            size: 18,
            weight: 'bold',
            color: '#333333',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 50,
        },
      },
      subhead: {
        id: 'subhead',
        type: 'text',
        position: { center_x: 350, center_y: 60 },
        dimensions: { width: 300, height: 20 },
        locked_properties: ['type', 'position', 'dimensions', 'font.family', 'font.size'],
        editable_properties: ['content', 'font.color'],
        properties: {
          content: 'Your subhead goes here',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'normal',
            color: '#666666',
            alignment: 'left',
          },
        },
        constraints: {
          max_content_length: 80,
        },
      },
      cta_button: {
        id: 'cta_button',
        type: 'button',
        position: { center_x: 650, center_y: 47.5 },
        dimensions: { width: 120, height: 32 },
        locked_properties: ['type', 'position', 'dimensions', 'background.border_radius'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'CTA button',
            font: {
              family: 'Arial, sans-serif',
              size: 14,
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
      rollback_button: {
        id: 'rollback_button',
        type: 'button',
        position: { center_x: 780, center_y: 47.5 },
        dimensions: { width: 80, height: 25 },
        locked_properties: [
          'type',
          'position',
          'dimensions',
          'background',
          'text.font.family',
          'text.font.size',
        ],
        editable_properties: ['text.content', 'text.font.color'],
        properties: {
          text: {
            content: 'Rollback',
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'normal',
              color: '#666666',
            },
          },
          background: {
            color: 'transparent',
            border_radius: 3,
            border: { width: 1, color: '#cccccc' },
          },
          hover: {
            background_color: '#f8f9fa',
            text_color: '#333333',
          },
        },
        constraints: {
          max_content_length: 10,
        },
      },
      disclaimer: {
        id: 'disclaimer',
        type: 'text',
        position: { center_x: 430, center_y: 85 },
        dimensions: { width: 400, height: 15 },
        locked_properties: [
          'type',
          'position',
          'dimensions',
          'font.family',
          'font.size',
          'font.alignment',
        ],
        editable_properties: ['content', 'font.color'],
        properties: {
          content: 'Disclaimer message goes here',
          font: {
            family: 'Arial, sans-serif',
            size: 10,
            weight: 'normal',
            color: '#999999',
            alignment: 'center',
          },
        },
        constraints: {
          max_content_length: 120,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['header', 'standard', 'corporate'],
    },
  },

  {
    id: 'social-banner-1200x628',
    name: 'Social Media Banner',
    description: 'Social media banner for Facebook, Twitter, LinkedIn',
    category: 'social',
    dimensions: {
      width: 1200,
      height: 628,
      unit: 'px',
    },
    elements: {
      background_image: {
        id: 'background_image',
        type: 'image',
        position: { center_x: 600, center_y: 314 },
        dimensions: { width: 1200, height: 628 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['source', 'alt_text', 'opacity'],
        properties: {
          source: 'placeholder-background.jpg',
          alt_text: 'Background Image',
          opacity: 0.8,
        },
      },
      main_title: {
        id: 'main_title',
        type: 'text',
        position: { center_x: 600, center_y: 250 },
        dimensions: { width: 800, height: 60 },
        locked_properties: ['type', 'position', 'dimensions', 'font.family'],
        editable_properties: ['content', 'font.color', 'font.size', 'font.weight'],
        properties: {
          content: 'Your Main Title Here',
          font: {
            family: 'Arial, sans-serif',
            size: 48,
            weight: 'bold',
            color: '#ffffff',
            alignment: 'center',
          },
        },
        constraints: {
          max_content_length: 30,
        },
      },
      subtitle: {
        id: 'subtitle',
        type: 'text',
        position: { center_x: 600, center_y: 320 },
        dimensions: { width: 600, height: 40 },
        locked_properties: ['type', 'position', 'dimensions', 'font.family', 'font.size'],
        editable_properties: ['content', 'font.color'],
        properties: {
          content: 'Subtitle or description text',
          font: {
            family: 'Arial, sans-serif',
            size: 24,
            weight: 'normal',
            color: '#ffffff',
            alignment: 'center',
          },
        },
        constraints: {
          max_content_length: 60,
        },
      },
      cta_button: {
        id: 'cta_button',
        type: 'button',
        position: { center_x: 600, center_y: 420 },
        dimensions: { width: 200, height: 50 },
        locked_properties: ['type', 'position', 'dimensions'],
        editable_properties: ['text.content', 'background.color', 'text.font.color'],
        properties: {
          text: {
            content: 'Get Started',
            font: {
              family: 'Arial, sans-serif',
              size: 18,
              weight: 'bold',
              color: '#ffffff',
            },
          },
          background: {
            color: '#28a745',
            border_radius: 25,
            border: { width: 0, color: 'transparent' },
          },
          hover: {
            background_color: '#218838',
            text_color: '#ffffff',
          },
        },
        constraints: {
          max_content_length: 20,
        },
      },
    },
    metadata: {
      version: '1.0',
      created_date: '2024-01-01',
      author: 'Banner Editor',
      tags: ['social', 'facebook', 'twitter', 'linkedin'],
    },
  },
]

// User can add these additional elements to any banner
export const ADDABLE_ELEMENTS = {
  shape: {
    type: 'shape',
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
    type: 'text',
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
    type: 'image',
    default_properties: {
      source: 'placeholder.jpg',
      alt_text: 'Image',
      opacity: 1,
    },
    editable_properties: ['source', 'alt_text', 'opacity', 'position', 'dimensions'],
  },
}
