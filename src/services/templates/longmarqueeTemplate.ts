import type { CanvasElement } from '@/stores/canvas'
import type { AdUnitFrame } from './adUnitFrame'

// ✅ Frame configuration for this template
export const longmarqueeFrameConfig: AdUnitFrame = {
  id: 'longmarquee',
  title: 'Long Marquee',
  dimensions: { width: 860, height: 95 },
  position: { x: 0, y: 0 },
}

// ✅ Pure ad unit content (no frame - coordinates relative to 0,0)
export const getLongmarqueeAdUnit = (): CanvasElement[] => {
  return [
    // Background
    {
      id: 'background',
      type: 'rect',
      x: 0,
      y: 0,
      width: 860,
      height: 95,
      fill: '#ffffff',
    },
    // Headline placeholder
    {
      id: 'headline',
      type: 'text',
      x: 92,
      y: 12,
      text: '',
      fontSize: 11,
      fontFamily: 'Sans',
      fontStyle: 'bold',
      fill: '#001e60',
      align: 'left',
      tag: 'headline', //New tags!!
    },

    // Logo placeholder
    {
      id: 'logo',
      type: 'image',
      x: 10,
      y: 42,
      width: 58,
      height: 11,
      fill: '#808080',
      image: '',
      tag: 'logo', //New tags!!
    },
    // Subhead placeholder
    {
      id: 'subhead',
      type: 'text',
      x: 91,
      y: 29,
      text: '',
      fontSize: 5.4,
      fontFamily: 'Sans',
      fill: '#001e60',
      align: 'left',
      tag: 'subhead', //New tags!!
    },
    // CTA Button placeholder
    {
      id: 'cta-background',
      type: 'rect',
      x: 91,
      y: 63,
      width: 57,
      height: 18,
      cornerRadius: 8,
      strokeColor: '#001e60',
      fill: '#ffffffff',
      strokeWidth: 0.54,
    },
    // CTA Button text
    {
      id: 'background',
      type: 'text',
      x: 91,
      y: 63,
      width: 57,
      height: 18,
      text: '',
      fontSize: 5.8,
      fontFamily: 'Sans',
      align: 'center',
      wrap: 'none',
      verticalAlign: 'middle',
      cornerRadius: 8,
      fill: '#001e60',
      tag: 'cta', //New tags!!
    },

    // Image placeholder
    {
      id: 'image',
      type: 'image',
      x: 430,
      y: 0,
      image: '',
      width: 430,
      height: 95,
      tag: 'image', //New tags!!
      crop: {
        x: 15,
        y: 459.3,
        width: 2440,
        height: 470,
      },
    },
    // Disclaimer
    {
      id: 'disclaimer',
      type: 'text',
      x: 590,
      y: 84,
      width: 261,
      height: 6,
      text: '',
      fontSize: 6,
      fontFamily: 'Sans',
      fill: '#ffffff',
      align: 'right',
      wrap: 'none',
      tag: 'disclaimer', //New tags!!
    },
  ]
}
