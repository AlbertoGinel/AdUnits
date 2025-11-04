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
      id: 'longmarquee-background',
      type: 'rect',
      x: 0,
      y: 0,
      width: 860,
      height: 95,
      fill: '#ffffff',
    },
    // Headline placeholder
    {
      id: 'longmarquee-headline',
      type: 'text',
      x: 92,
      y: 12,
      text: 'Headline goes here',
      fontSize: 11,
      fontFamily: 'Sans',
      fontStyle: 'bold',
      fill: '#001e60',
      align: 'left',
    },

    // Logo placeholder
    {
      id: 'longmarquee-logo',
      type: 'image',
      x: 10,
      y: 42,
      width: 58,
      height: 11,
      fill: '#808080',
      image: '/logo.png',
    },
    // Subhead placeholder
    {
      id: 'longmarquee-subhead',
      type: 'text',
      x: 91,
      y: 29,
      text: 'Your subhead goes here',
      fontSize: 5.4,
      fontFamily: 'Sans',
      fill: '#001e60',
      align: 'left',
    },
    // CTA Button placeholder
    {
      id: 'longmarquee-cta-background',
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
      id: 'longmarquee-cta-background',
      type: 'text',
      x: 91,
      y: 63,
      width: 57,
      height: 18,
      text: 'CTA button',
      fontSize: 5.8,
      fontFamily: 'Sans',
      align: 'center',
      wrap: 'none',
      verticalAlign: 'middle',
      cornerRadius: 8,
      fill: '#001e60',
    },

    // Image placeholder
    {
      id: 'longmarquee-image',
      type: 'image',
      x: 430,
      y: 0,
      image: '/image.png',
      width: 430,
      height: 95,
      crop: {
        x: 15,
        y: 459.3,
        width: 2440,
        height: 470,
      },
    },
    // Disclaimer
    {
      id: 'longmarquee-disclaimer',
      type: 'text',
      x: 590,
      y: 84,
      width: 261,
      height: 6,
      text: 'This is placeholder disclaimer text and does not constitute legal advice. Use at your own risk.',
      fontSize: 6,
      fontFamily: 'Sans',
      fill: '#ffffff',
      align: 'right',
      wrap: 'none',
    },
  ]
}
